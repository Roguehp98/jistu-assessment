type Item = Record<string, unknown>;

const RESERVED_QUERY_KEYS = new Set(["_page", "_per_page", "_sort", "_where"]);

const isRecord = (value: unknown): value is Item =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const matchesCondition = (value: unknown, condition: unknown) => {
	if (!isRecord(condition)) return value === condition;

	if ("in" in condition) {
		return Array.isArray(condition.in) && condition.in.includes(value);
	}

	if ("contains" in condition) {
		return (
			typeof value === "string" &&
			typeof condition.contains === "string" &&
			value.toLowerCase().includes(condition.contains.toLowerCase())
		);
	}

	if ("gte" in condition && typeof condition.gte === "string") {
		if (typeof value !== "string" || value < condition.gte) return false;
	}

	if ("lte" in condition && typeof condition.lte === "string") {
		if (typeof value !== "string" || value > condition.lte) return false;
	}

	return true;
};

const matchesWhere = (item: Item, where: Item): boolean =>
	Object.entries(where).every(([field, condition]) => {
		if (field === "or")
			return (
				Array.isArray(condition) &&
				condition.some((entry) => isRecord(entry) && matchesWhere(item, entry))
			);

		return matchesCondition(item[field], condition);
	});

const filterItems = <T extends Item>(items: T[], searchParams: URLSearchParams) => {
	let where: Item = {};
	const rawWhere = searchParams.get("_where");

	if (rawWhere) {
		try {
			const parsedWhere: unknown = JSON.parse(rawWhere);

			if (isRecord(parsedWhere)) where = parsedWhere;
		} catch {
			where = {};
		}
	}

	return items.filter((item) => {
		for (const [field, value] of searchParams) {
			if (RESERVED_QUERY_KEYS.has(field)) continue;
			if (String(item[field] ?? "") !== value) return false;
		}

		return matchesWhere(item, where);
	});
};

const compareValues = (left: unknown, right: unknown) => {
	if (left === right) return 0;
	if (left === null || left === undefined) return -1;
	if (right === null || right === undefined) return 1;

	return String(left).localeCompare(String(right), "en", {
		numeric: true,
		sensitivity: "base",
	});
};

const sortItems = <T extends Item>(items: T[], sort: string | null) => {
	if (!sort) return items;

	const fields = sort.split(",").filter(Boolean);

	return [...items].sort((left, right) => {
		for (const rawField of fields) {
			const isDescending = rawField.startsWith("-");
			const field = isDescending ? rawField.slice(1) : rawField;
			const comparison = compareValues(left[field], right[field]);

			if (comparison !== 0) return isDescending ? -comparison : comparison;
		}

		return 0;
	});
};

const getPositiveInteger = (value: string | null, fallback: number) => {
	const parsed = Number.parseInt(value ?? "", 10);

	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const queryItems = <T extends Item>(items: T[], requestUrl: string) => {
	const searchParams = new URL(requestUrl).searchParams;
	const filteredItems = filterItems(items, searchParams);
	const sortedItems = sortItems(filteredItems, searchParams.get("_sort"));

	if (!searchParams.has("_page")) return sortedItems;

	const page = getPositiveInteger(searchParams.get("_page"), 1);
	const perPage = getPositiveInteger(searchParams.get("_per_page"), 10);
	const itemCount = sortedItems.length;
	const pageCount = Math.ceil(itemCount / perPage);
	const start = (page - 1) * perPage;

	return {
		first: pageCount > 0 ? 1 : 0,
		prev: page > 1 && page <= pageCount + 1 ? page - 1 : null,
		next: page < pageCount ? page + 1 : null,
		last: pageCount,
		pages: pageCount,
		items: itemCount,
		data: sortedItems.slice(start, start + perPage),
	};
};
