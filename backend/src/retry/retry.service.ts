// CREDIT: thanks to Vitaly Tomilov
// all of this retry logic is taken from his work at
// https://github.com/vitaly-t/retry-async
// https://gist.github.com/vitaly-t/6e3d285854d882b1618c7e435df164c4

import { Injectable } from "@nestjs/common";

/**
 * Retry-status object type, for use with RetryCB.
 */
export type RetryStatus = {
	/**
	 * Retry index, starting from 0.
	 */
	index: number;
	/**
	 * Retry overall duration, in milliseconds.
	 */
	duration: number;
	/**
	 * Last error, if available;
	 * it is undefined only when "retryAsync" calls "func" with index = 0.
	 */
	error?: any;
};

/**
 * Retry-status callback type.
 */
export type RetryCB<T> = (s: RetryStatus) => T;

/**
 * Type for options passed into retryAsync function.
 */
export type RetryOptions = {
	/**
	 * Maximum number of retries (infinite by default),
	 * or a callback to indicate the need for another retry.
	 */
	retry?: number | RetryCB<boolean>;
	/**
	 * Retry delays, in milliseconds (no delay by default),
	 * or a callback that returns the delays.
	 */
	delay?: number | RetryCB<number>;
	/**
	 * Error notifications.
	 */
	error?: RetryCB<void>;
};

const RETRIES = 5; // Or any number of retries you'd like to set

@Injectable()
export class RetryService {
	/**
	 * Retries async operation returned from "func" callback, according to "options".
	 */
	async retryAsync<T>(
		func: RetryCB<Promise<T>>,
		options?: RetryOptions,
	): Promise<T> {
		const start = Date.now();
		let index = 0,
			e: any;
		let { retry = Number.POSITIVE_INFINITY, delay = -1, error } = options ?? {};
		const s = () => ({ index, duration: Date.now() - start, error: e });
		const c = (): Promise<T> =>
			func(s()).catch((err) => {
				e = err;
				typeof error === "function" && error(s());
				if (
					(typeof retry === "function" ? (retry(s()) ? 1 : 0) : retry--) <= 0
				) {
					return Promise.reject(e);
				}
				const d = typeof delay === "function" ? delay(s()) : delay;
				index++;
				return d >= 0 ? new Promise((a) => setTimeout(a, d)).then(c) : c();
			});
		return c();
	}

	async spotifyRequestWithRetries(
		request: Promise<any>,
		retries: number = RETRIES,
	): Promise<any> {
		const executeRequest = async (status: RetryStatus) => {
			if (status.index > 0) {
				console.log(`Retrying... Attempt #${status.index + 1}`);
			}
			return await request;
		};

		// Call retryAsync, passing the function and options
		return this.retryAsync(executeRequest, {
			retry: retries,
			delay: (status: RetryStatus) => {
				// Optionally use exponential backoff or fixed delay
				const delay = Math.pow(2, status.index) * 100; // Exponential backoff (100ms * 2^index)
				console.log(`Waiting for ${delay}ms before next attempt...`);
				return delay;
			},
			error: (status: RetryStatus) => {
				console.log(
					`Error encountered on attempt #${status.index + 1}:`,
					status.error.message,
				);
			},
		});
	}
}
