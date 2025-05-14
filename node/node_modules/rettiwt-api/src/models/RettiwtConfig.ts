import { Agent } from 'https';

import { HttpsProxyAgent } from 'https-proxy-agent';

import { AuthService } from '../services/internal/AuthService';
import { ITidProvider } from '../types/auth/TidProvider';
import { IErrorHandler } from '../types/ErrorHandler';
import { IRettiwtConfig } from '../types/RettiwtConfig';

export class RettiwtConfig implements IRettiwtConfig {
	// Parameters for internal use
	private _apiKey?: string;
	private _httpsAgent: Agent;
	private _userId: string | undefined;

	// Parameters that can be set once, upon initialization
	public readonly delay?: number | (() => number | Promise<number>);
	public readonly errorHandler?: IErrorHandler;
	public readonly logging?: boolean;
	public readonly tidProvider?: ITidProvider;
	public readonly timeout?: number;

	// Parameters that can be changed on the fly
	public headers?: { [key: string]: string };

	/**
	 * @param config - The config for Rettiwt of type {@link IRettiwtConfig}.
	 */
	public constructor(config?: IRettiwtConfig) {
		this._apiKey = config?.apiKey;
		this._httpsAgent = config?.proxyUrl ? new HttpsProxyAgent(config?.proxyUrl) : new Agent();
		this._userId = config?.apiKey ? AuthService.getUserId(config?.apiKey) : undefined;
		this.delay = config?.delay;
		this.errorHandler = config?.errorHandler;
		this.logging = config?.logging;
		this.tidProvider = config?.tidProvider;
		this.timeout = config?.timeout;
		this.apiKey = config?.apiKey;
		this.headers = config?.headers;
	}

	public get apiKey(): string | undefined {
		return this._apiKey;
	}

	/** The HTTPS agent instance to use. */
	public get httpsAgent(): Agent {
		return this._httpsAgent;
	}

	/** The ID of the user associated with the API key, if any. */
	public get userId(): string | undefined {
		return this._userId;
	}

	public set apiKey(apiKey: string | undefined) {
		this._apiKey = apiKey;
		this._userId = apiKey ? AuthService.getUserId(apiKey) : undefined;
	}

	public set proxyUrl(proxyUrl: URL | undefined) {
		this._httpsAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : new Agent();
	}
}
