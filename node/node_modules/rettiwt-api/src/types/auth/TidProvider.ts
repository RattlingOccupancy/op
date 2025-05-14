/**
 * Service responsible for generating the `x-client-transaction-id` header.
 *
 * @public
 */
export interface ITidProvider {
	/**
	 * Generates new `x-client-transaction-id` header.
	 *
	 * @param method - Request method.
	 * @param path - Endpoint path without query parameters.
	 */
	generate(method: string, path: string): Promise<string | undefined>;

	/**
	 * Refresh arguments obtained from parsing the HTML page, if any.
	 */
	refreshDynamicArgs(): Promise<void>;
}
