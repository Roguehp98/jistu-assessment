import { Alert, Button, Input } from "antd";
import type { ChangeEventHandler, FC, SubmitEventHandler } from "react";
import {
	type InferOutput,
	length,
	maxValue,
	minValue,
	number,
	pipe,
	safeParse,
	tuple,
} from "valibot";

import { sortByNearestNeighbor } from "@web/libs/nearest-neighbor-algo";
import type { Coordinate, LocationMapPoint } from "@web/types/ui/location-map";
import LocationMap from "@web/ui/elements/location-map/wrapper";

const LatitudeSchema = pipe(number(), minValue(-90), maxValue(90));
const LongitudeSchema = pipe(number(), minValue(-180), maxValue(180));
const CoordinateSchema = tuple([LatitudeSchema, LongitudeSchema]);
const LocationMapInputSchema = pipe(
	tuple([CoordinateSchema, CoordinateSchema, CoordinateSchema, CoordinateSchema]),
	length(4),
);

type LocationMapCoordinates = InferOutput<typeof LocationMapInputSchema>;

export type LocationMapInput = string;

const formatCoordinates = (coordinates: LocationMapCoordinates) =>
	coordinates.map(([latitude, longitude]) => `${latitude}, ${longitude}`).join("\n");

const parseCoordinates = (value: string): LocationMapCoordinates | null => {
	const values = value
		.split(/[\s,]+/)
		.filter(Boolean)
		.map(Number);

	if (values.length !== 8 || values.some((coordinate) => !Number.isFinite(coordinate))) return null;

	const result = safeParse(LocationMapInputSchema, [
		[values[0], values[1]],
		[values[2], values[3]],
		[values[4], values[5]],
		[values[6], values[7]],
	]);

	return result.success ? result.output : null;
};

export const DEFAULT_LOCATION_MAP_INPUT: LocationMapInput = formatCoordinates([
	[10.7725, 106.698],
	[10.7725, 106.6945],
	[10.7769, 106.7009],
	[10.7733, 106.7005],
]);

export const parseLocationMapInput = (
	value: unknown = DEFAULT_LOCATION_MAP_INPUT,
): LocationMapInput | null => {
	if (typeof value !== "string") return null;

	const coordinates = parseCoordinates(value);

	return coordinates ? formatCoordinates(coordinates) : null;
};

type ILocationMapPlayground = {
	input?: LocationMapInput;
	onInputChange?: (input: LocationMapInput) => void;
};

const LocationMapPlayground: FC<ILocationMapPlayground> = ({
	input: controlledInput,
	onInputChange,
}) => {
	const [localInput, setLocalInput] = useState(DEFAULT_LOCATION_MAP_INPUT);
	const input = controlledInput ?? localInput;
	const [inputValue, setInputValue] = useState(input);
	const [inputError, setInputError] = useState<string | null>(null);
	const coordinates = useMemo(() => parseCoordinates(input) ?? [], [input]);
	const sortedPoints = useMemo(
		() =>
			sortByNearestNeighbor(
				coordinates.map(([lat, lng], index) => ({
					coordinate: [lat, lng] as Coordinate,
					id: `point-${index + 1}`,
					lat,
					lng,
				})),
			),
		[coordinates],
	);
	const sortedCoordinates = useMemo(
		() => sortedPoints.map(({ coordinate }) => coordinate),
		[sortedPoints],
	);
	const mapPoints = useMemo<LocationMapPoint[]>(
		() =>
			sortedPoints.map(({ coordinate, id }, index) => ({
				coordinate,
				id,
				title: `Stop ${index + 1}`,
				variant: index === 0 ? "success" : "info",
			})),
		[sortedPoints],
	);
	useEffect(() => {
		setInputValue(input);
		setInputError(null);
	}, [input]);

	const handleInputValueChange: ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => {
		setInputValue(target.value);
	};

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();

		const parsedInput = parseLocationMapInput(inputValue);

		if (!parsedInput) {
			setInputError(
				"Enter four latitude, longitude pairs within valid ranges, separated by commas, spaces, or new lines",
			);
			return;
		}

		setInputError(null);
		setInputValue(parsedInput);

		if (onInputChange) {
			onInputChange(parsedInput);
		} else {
			setLocalInput(parsedInput);
		}
	};

	return (
		<div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
			<section aria-labelledby="location-map-heading">
				<h2 id="location-map-heading" className="mb-3 text-base font-semibold text-foreground">
					Location map
				</h2>

				<form onSubmit={handleSubmit}>
					<label className="mb-2 block text-sm font-medium text-label" htmlFor="coordinates">
						Four latitude, longitude pairs
					</label>
					<Input.TextArea
						id="coordinates"
						aria-describedby={inputError ? "coordinates-error" : undefined}
						aria-invalid={Boolean(inputError)}
						autoCapitalize="off"
						autoComplete="off"
						className="font-mono"
						rows={6}
						spellCheck={false}
						status={inputError ? "error" : undefined}
						value={inputValue}
						onChange={handleInputValueChange}
					/>

					{inputError && (
						<Alert
							id="coordinates-error"
							className="mt-3"
							title={inputError}
							showIcon
							type="error"
						/>
					)}

					<div className="mt-4">
						<Button htmlType="submit" type="primary">
							Apply
						</Button>
					</div>
				</form>

				<h3 className="mb-3 mt-8 text-base font-semibold text-foreground">Sorted route</h3>
				<ol className="space-y-2 text-sm text-label">
					{sortedPoints.map(({ coordinate, id }, index) => (
						<li key={id} className="flex gap-3 font-mono">
							<span className="w-5 shrink-0 text-right text-muted">{index + 1}.</span>
							<span>{coordinate.join(", ")}</span>
						</li>
					))}
				</ol>
			</section>

			<section aria-label="Route preview" className="min-w-0">
				<LocationMap path={sortedCoordinates} points={mapPoints} />
			</section>
		</div>
	);
};

export default LocationMapPlayground;
