import { attemptAsync } from "es-toolkit";
import { FetchError } from "ofetch";
import type { BareFetcher, Key, SWRConfiguration, SWRResponse } from "swr";
import useSWR from "swr";
import { cache } from "swr/_internal";
import useSWRMutation, {
	type MutationFetcher,
	type SWRMutationConfiguration,
	type SWRMutationResponse,
} from "swr/mutation";
import { ValiError } from "valibot";

import { ACTION_STATUS } from "@web/types/system";

import { INITIAL_ACTION_STATUS } from "./actions";

export const BASE_CONFIG: SWRConfiguration = {
	dedupingInterval: 3_000,
	focusThrottleInterval: 30_000,
	revalidateOnFocus: import.meta.env.PROD,
	revalidateOnReconnect: import.meta.env.PROD,
	refreshInterval: 5 * 60_000,
};

type BaseResponse = {
	status: ACTION_STATUS;
	message: string;
};

type EnhancedSWRResponse<Data extends BaseResponse, Error = unknown> = Omit<
	SWRResponse<Data, Error>,
	"data"
> & {
	data: Data | undefined;
	isError: boolean;
};

export const useEnhancedSWR = <Data extends BaseResponse, Error = unknown>(
	key: Key,
	fetcher: BareFetcher<Data> | null,
	config?: SWRConfiguration,
): EnhancedSWRResponse<Data, Error> => {
	const mergedConfig = { ...BASE_CONFIG, ...config };
	const swr = useSWR<Data, Error>(key, fetcher, mergedConfig) as EnhancedSWRResponse<Data, Error>;
	const { error } = swr;

	/* load-bearing memo (not compiler-reliant): consumers key side effects on data ref; new ref per render = duplicate navigate/toast */
	const data = useMemo(() => {
		let result = (swr.data || INITIAL_ACTION_STATUS) as Data;

		if (error) {
			if (error instanceof ValiError)
				result = {
					status: ACTION_STATUS.ERROR,
					message: "Please try again",
					data: null,
				} as unknown as Data;
			else
				result = {
					status: ACTION_STATUS.ERROR,
					message: "Something goes wrong",
					data: null,
				} as unknown as Data;
		}

		if (!result.message) {
			let message = result.message;
			if (result.status === ACTION_STATUS.ERROR) message = "Something goes wrong";
			else if (result.status === ACTION_STATUS.SUCCESS) message = "Success";
			if (message) result = { ...result, message };
		}

		return result;
	}, [swr.data, error]);

	const isError = data.status === ACTION_STATUS.ERROR;

	return { ...swr, data, isError };
};

type MutationResponse<Data extends BaseResponse, Error = unknown, Args = unknown> = Omit<
	SWRMutationResponse<Data, Error, Key, Args>,
	"data" | "trigger"
> & {
	data: Data | undefined;
	trigger: (
		...args: Parameters<SWRMutationResponse<Data, Error, Key, Args>["trigger"]>
	) => Promise<Data>;
	isError: boolean;
};

const ACTION_STATUS_VALUES: Set<string> = new Set(Object.values(ACTION_STATUS));

const mapErrorToResponse = <Data extends BaseResponse>(error: unknown): Data => {
	if (
		error instanceof FetchError &&
		error.data &&
		typeof error.data === "object" &&
		"status" in error.data &&
		ACTION_STATUS_VALUES.has((error.data as { status: string }).status)
	)
		return error.data as Data;
	if (error instanceof ValiError)
		return {
			status: ACTION_STATUS.ERROR,
			message: "Please try again",
			data: null,
		} as unknown as Data;

	return {
		status: ACTION_STATUS.ERROR,
		message: "Something goes wrong",
		data: null,
	} as unknown as Data;
};

export const useEnhancedSWRMutation = <
	Data extends BaseResponse,
	Error = unknown,
	MutationKey extends Key = Key,
	Args = unknown,
>(
	key: MutationKey,
	fetcher: MutationFetcher<Data, MutationKey, Args>,
	config?: SWRMutationConfiguration<Data, Error, MutationKey, Args>,
): MutationResponse<Data, Error, Args> => {
	const mutation = useSWRMutation<Data, Error, MutationKey, Args>(key, fetcher, config);
	const { error } = mutation;

	/* same ref-stability contract as useEnhancedSWR */
	const data = useMemo(() => {
		let result = (mutation.data || INITIAL_ACTION_STATUS) as Data;

		if (error) result = mapErrorToResponse<Data>(error);

		if (!result.message) {
			let message = result.message;
			if (result.status === ACTION_STATUS.ERROR) message = "Somethng goes wrong";
			else if (result.status === ACTION_STATUS.SUCCESS) message = "Success";
			if (message) result = { ...result, message };
		}

		return result;
	}, [mutation.data, error]);

	const isError = data.status === ACTION_STATUS.ERROR;

	const trigger = useCallback(
		async (
			...args: Parameters<SWRMutationResponse<Data, Error, MutationKey, Args>["trigger"]>
		): Promise<Data> => {
			const triggerMutation = mutation.trigger as (...a: typeof args) => Promise<Data | undefined>;
			const [error, response] = await attemptAsync(() => triggerMutation(...args));

			/* trigger can resolve undefined; never return it or callers crash on .status */
			if (error) return mapErrorToResponse<Data>(error);

			return response ?? mapErrorToResponse<Data>(new Error("empty mutation response"));
		},
		[mutation.trigger],
	);

	return { ...mutation, trigger, data, isError } as MutationResponse<Data, Error, Args>;
};

export const clearSWRCache = () => {
	for (const key of cache.keys()) cache.delete(key);
};
