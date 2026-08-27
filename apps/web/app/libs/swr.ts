import type { Fetcher, SWRConfiguration } from "swr";
import useSWR from "swr";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

import { ACTION_STATUS } from "@web/types/system";

export interface BaseResponse {
	status: ACTION_STATUS;
	message: string;
	data?: unknown;
}

export const INITIAL_STATUS: BaseResponse = {
	status: ACTION_STATUS.NORMAL,
	message: "",
	data: null,
};

export const getInitialStatus = <R extends BaseResponse>() => INITIAL_STATUS as R;

export const BASE_CONFIG: SWRConfiguration = {
	revalidateOnFocus: false,
	revalidateOnReconnect: false,
	refreshInterval: 5 * 60_000,
};

type QueryResult<R extends BaseResponse, P extends readonly unknown[]> = {
	key: [string, ...P];
	fetcher: Fetcher<R, [string, ...P]>;
};

export const useEnhancedSWR = <R extends BaseResponse, P extends readonly unknown[]>(
	queryFactory: (params: P) => QueryResult<R, P>,
	params: P,
	configs = {} as SWRConfiguration,
) => {
	const mergedConfig = { ...BASE_CONFIG, ...configs };
	const { key, fetcher } = queryFactory(params);
	const swr = useSWR(key, fetcher, mergedConfig);

	let data = swr.data ?? getInitialStatus<R>();

	const { error } = swr;

	if (error) {
		data = {
			...data,
			status: ACTION_STATUS.ERROR,
			message: "Error",
			data: null,
		};
	}

	if (!data.message) {
		data.message = "Success";
	}

	return { ...swr, data, isError: data.status === ACTION_STATUS.ERROR };
};

type UseEnhancedSWRMutationOptions<Input, Output extends BaseResponse> = {
	key: string;
	config?: SWRMutationConfiguration<Output, Error, string, Input>;
};

export const useEnhancedSWRMutation = <Input = void, Output extends BaseResponse = BaseResponse>(
	fetcher: (arg: Input) => Promise<Output>,
	options: UseEnhancedSWRMutationOptions<Input, Output>,
) => {
	const key = options.key;

	const swr = useSWRMutation(key, (_, { arg }: { arg: Input }) => fetcher(arg), options?.config);

	let data = swr.data ?? getInitialStatus<Output>();

	const { error } = swr;

	if (error) {
		data = {
			...data,
			status: ACTION_STATUS.ERROR,
			message: "Error",
			data: null,
		};
	}

	if (!data.message) {
		data.message = "Success";
	}

	return { ...swr, data, isError: data.status === ACTION_STATUS.ERROR };
};
