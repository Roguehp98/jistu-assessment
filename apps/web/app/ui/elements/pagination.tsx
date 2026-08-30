import { Pagination as AntPagination, Select } from "antd";
import type { FC } from "react";

type IPagination = {
	current: number;
	pageSize: number;
	pageSizeId: string;
	pageSizeOptions: number[];
	total: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
};

const Pagination: FC<IPagination> = ({
	current,
	pageSize,
	pageSizeId,
	pageSizeOptions,
	total,
	onPageChange,
	onPageSizeChange,
}) => {
	if (total <= 0) return null;

	return (
		<div className="mt-5 overflow-x-auto pb-1">
			<div className="flex min-w-max items-center justify-between gap-6">
				<div className="flex shrink-0 items-center gap-2">
					<label className="text-sm font-medium text-label" htmlFor={pageSizeId}>
						Rows per page
					</label>
					<Select
						id={pageSizeId}
						className="w-28"
						value={pageSize}
						options={pageSizeOptions.map((value) => ({ value, label: value }))}
						onChange={onPageSizeChange}
					/>
				</div>

				<AntPagination
					current={current}
					pageSize={pageSize}
					responsive
					showSizeChanger={false}
					total={total}
					onChange={onPageChange}
				/>
			</div>
		</div>
	);
};

export default Pagination;
