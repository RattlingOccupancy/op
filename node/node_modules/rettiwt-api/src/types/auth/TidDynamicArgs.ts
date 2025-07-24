/**
 * Internal args used for generating trasaction ID.
 *
 * @internal
 */
export interface ITidDynamicArgs {
	verificationKey: string;
	frames: number[][][];
	indices: number[];
}
