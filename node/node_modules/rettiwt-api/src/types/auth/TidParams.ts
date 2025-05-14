/**
 * The parameters for generating the transaction ID.
 *
 * @internal
 */
export interface ITidParams {
	/** Secret used for transaction ID calculation. */
	keyword: string;

	/** Request method. */
	method: string;

	/** Endpoint path without query parameters. */
	path: string;

	/** Twitter verification key received from HTML. */
	verificationKey: string;

	/** Animation frames extracted from HTML. */
	frames: number[][][];

	/** Indices used for getting the correct verification key bytes during animation key calculation. */
	indices: number[];

	/** Final byte of the transaction ID. */
	extraByte: number;

	/** Current time */
	time?: number;

	/** XOR byte used for final hash calculation, must be in 0-255 range. */
	xorByte?: number;

	/** Precomputed animation key. */
	animationKey?: string;
}
