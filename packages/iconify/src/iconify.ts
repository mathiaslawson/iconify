// Core
import { IconifyJSON, IconifyIcon } from '@iconify/types';
import { IconifyIconName } from '@iconify/utils/lib/icon/name';
import {
	IconifyIconCustomisations,
	IconifyIconSize,
	IconifyHorizontalIconAlignment,
	IconifyVerticalIconAlignment,
} from '@iconify/utils/lib/customisations';
import { IconifyIconBuildResult } from '@iconify/utils/lib/svg/build';
import {
	IconifyStorageFunctions,
	storageFunctions,
} from '@iconify/core/lib/storage/functions';
import {
	IconifyBuilderFunctions,
	builderFunctions,
} from '@iconify/core/lib/builder/functions';

// Cache
import { storeCache, loadCache } from '@iconify/core/lib/browser-storage/';
import { cache } from '@iconify/core/lib/cache';
import {
	IconifyBrowserCacheFunctions,
	IconifyBrowserCacheType,
	toggleBrowserCache,
} from '@iconify/core/lib/browser-storage/functions';

// API
import {
	IconifyAPIFunctions,
	IconifyAPIInternalFunctions,
	APIFunctions,
	APIInternalFunctions,
	IconifyAPIQueryParams,
	IconifyAPICustomQueryParams,
	IconifyAPIMergeQueryParams,
} from '@iconify/core/lib/api/functions';
import {
	setAPIModule,
	IconifyAPIModule,
	IconifyAPISendQuery,
	IconifyAPIPrepareIconsQuery,
} from '@iconify/core/lib/api/modules';
import {
	setAPIConfig,
	PartialIconifyAPIConfig,
	IconifyAPIConfig,
	GetAPIConfig,
} from '@iconify/core/lib/api/config';
import { jsonpAPIModule } from '@iconify/core/lib/api/modules/jsonp';
import {
	fetchAPIModule,
	getFetch,
	setFetch,
} from '@iconify/core/lib/api/modules/fetch';
import {
	IconifyIconLoaderCallback,
	IconifyIconLoaderAbort,
} from '@iconify/core/lib/api/icons';

// Other
import { IconifyCommonFunctions, commonFunctions } from './common';

/**
 * Export required types
 */
// Function sets
export {
	IconifyStorageFunctions,
	IconifyBuilderFunctions,
	IconifyBrowserCacheFunctions,
	IconifyAPIFunctions,
	IconifyAPIInternalFunctions,
};

// JSON stuff
export { IconifyIcon, IconifyJSON, IconifyIconName };

// Customisations
export {
	IconifyIconCustomisations,
	IconifyIconSize,
	IconifyHorizontalIconAlignment,
	IconifyVerticalIconAlignment,
};

// Build
export { IconifyIconBuildResult };

// API
export {
	IconifyAPIConfig,
	IconifyIconLoaderCallback,
	IconifyIconLoaderAbort,
	IconifyAPIModule,
	GetAPIConfig,
	IconifyAPIPrepareIconsQuery,
	IconifyAPISendQuery,
	PartialIconifyAPIConfig,
	IconifyAPIQueryParams,
	IconifyAPICustomQueryParams,
	IconifyAPIMergeQueryParams,
};

// Cache
export { IconifyBrowserCacheType };

/**
 * Iconify interface
 */
export interface IconifyGlobal
	extends IconifyStorageFunctions,
		IconifyBuilderFunctions,
		IconifyCommonFunctions,
		IconifyBrowserCacheFunctions,
		IconifyAPIFunctions {
	_api: IconifyAPIInternalFunctions;
}

/**
 * Browser cache functions
 */
const browserCacheFunctions: IconifyBrowserCacheFunctions = {
	// enableCache() has optional second parameter for backwards compatibility
	enableCache: (storage: IconifyBrowserCacheType, enable?: boolean) =>
		toggleBrowserCache(storage, enable !== false),
	disableCache: (storage: IconifyBrowserCacheType) =>
		toggleBrowserCache(storage, true),
};

/**
 * Global variable
 */
const Iconify = {
	// Exposed internal API functions
	_api: APIInternalFunctions,
} as unknown as IconifyGlobal;

// Add functions
[
	storageFunctions,
	builderFunctions,
	commonFunctions,
	browserCacheFunctions,
	APIFunctions,
].forEach((list) => {
	for (const key in list) {
		Iconify[key] = list[key];
	}
});

/**
 * Initialise stuff
 */
// Set API module
setAPIModule('', getFetch() ? fetchAPIModule : jsonpAPIModule);

/**
 * Function to enable node-fetch for getting icons on server side
 */
Iconify._api.setFetch = (nodeFetch: typeof fetch) => {
	setFetch(nodeFetch);
	setAPIModule('', fetchAPIModule);
};

/**
 * Browser stuff
 */
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
	// Set cache and load existing cache
	cache.store = storeCache;
	loadCache();

	interface WindowWithIconifyStuff {
		IconifyProviders?: Record<string, PartialIconifyAPIConfig>;
	}
	const _window = window as WindowWithIconifyStuff;

	// Set API from global "IconifyProviders"
	if (_window.IconifyProviders !== void 0) {
		const providers = _window.IconifyProviders;
		if (typeof providers === 'object' && providers !== null) {
			for (let key in providers) {
				const err = 'IconifyProviders[' + key + '] is invalid.';
				try {
					const value = providers[key];
					if (
						typeof value !== 'object' ||
						!value ||
						value.resources === void 0
					) {
						continue;
					}
					if (!setAPIConfig(key, value)) {
						console.error(err);
					}
				} catch (e) {
					console.error(err);
				}
			}
		}
	}
}

export default Iconify;
