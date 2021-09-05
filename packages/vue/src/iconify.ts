import { defineComponent } from 'vue';
import {
	DefineComponent,
	ComponentOptionsMixin,
	EmitsOptions,
	VNodeProps,
	AllowedComponentProps,
	ComponentCustomProps,
} from 'vue';

import { IconifyJSON } from '@iconify/types';

// Core
import { IconifyIconName, stringToIcon } from '@iconify/utils/lib/icon/name';
import {
	IconifyIconSize,
	IconifyHorizontalIconAlignment,
	IconifyVerticalIconAlignment,
} from '@iconify/utils/lib/customisations';
import {
	IconifyStorageFunctions,
	storageFunctions,
	getIconData,
	allowSimpleNames,
} from '@iconify/core/lib/storage/functions';
import {
	IconifyBuilderFunctions,
	builderFunctions,
} from '@iconify/core/lib/builder/functions';
import { IconifyIconBuildResult } from '@iconify/utils/lib/svg/build';
import { fullIcon, IconifyIcon } from '@iconify/utils/lib/icon';

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
import { jsonpAPIModule } from '@iconify/core/lib/api/modules/jsonp';
import {
	fetchAPIModule,
	getFetch,
	setFetch,
} from '@iconify/core/lib/api/modules/fetch';
import {
	setAPIConfig,
	PartialIconifyAPIConfig,
	IconifyAPIConfig,
	GetAPIConfig,
} from '@iconify/core/lib/api/config';
import {
	IconifyIconLoaderCallback,
	IconifyIconLoaderAbort,
} from '@iconify/core/lib/api/icons';

// Cache
import { cache } from '@iconify/core/lib/cache';
import { storeCache, loadCache } from '@iconify/core/lib/browser-storage';
import { toggleBrowserCache } from '@iconify/core/lib/browser-storage/functions';
import {
	IconifyBrowserCacheType,
	IconifyBrowserCacheFunctions,
} from '@iconify/core/lib/browser-storage/functions';

// Properties
import {
	RawIconCustomisations,
	IconifyIconOnLoad,
	IconProps,
	IconifyIconCustomisations,
	IconifyIconProps,
} from './props';

// Render SVG
import { render } from './render';

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

// Customisations and icon props
export {
	IconifyIconCustomisations,
	IconifyIconSize,
	IconifyHorizontalIconAlignment,
	IconifyVerticalIconAlignment,
	IconifyIconProps,
	IconProps,
	IconifyIconOnLoad,
};

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

// Builder functions
export { RawIconCustomisations, IconifyIconBuildResult };

/* Browser cache */
export { IconifyBrowserCacheType };

/**
 * Enable and disable browser cache
 */
export const enableCache = (storage: IconifyBrowserCacheType) =>
	toggleBrowserCache(storage, true);

export const disableCache = (storage: IconifyBrowserCacheType) =>
	toggleBrowserCache(storage, false);

/* Storage functions */
/**
 * Check if icon exists
 */
export const iconExists = storageFunctions.iconExists;

/**
 * Get icon data
 */
export const getIcon = storageFunctions.getIcon;

/**
 * List available icons
 */
export const listIcons = storageFunctions.listIcons;

/**
 * Add one icon
 */
export const addIcon = storageFunctions.addIcon;

/**
 * Add icon set
 */
export const addCollection = storageFunctions.addCollection;

/* Builder functions */
/**
 * Calculate icon size
 */
export const calculateSize = builderFunctions.calculateSize;

/**
 * Replace unique ids in content
 */
export const replaceIDs = builderFunctions.replaceIDs;

/**
 * Build SVG
 */
export const buildIcon = builderFunctions.buildIcon;

/* API functions */
/**
 * Load icons
 */
export const loadIcons = APIFunctions.loadIcons;

/**
 * Add API provider
 */
export const addAPIProvider = APIFunctions.addAPIProvider;

/**
 * Export internal functions that can be used by third party implementations
 */
export const _api = APIInternalFunctions;

/**
 * Initialise stuff
 */
// Enable short names
allowSimpleNames(true);

// Set API module
setAPIModule('', getFetch() ? fetchAPIModule : jsonpAPIModule);

/**
 * Function to enable node-fetch for getting icons on server side
 */
_api.setFetch = (nodeFetch: typeof fetch) => {
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
		IconifyPreload?: IconifyJSON[] | IconifyJSON;
		IconifyProviders?: Record<string, PartialIconifyAPIConfig>;
	}
	const _window = window as WindowWithIconifyStuff;

	// Load icons from global "IconifyPreload"
	if (_window.IconifyPreload !== void 0) {
		const preload = _window.IconifyPreload;
		const err = 'Invalid IconifyPreload syntax.';
		if (typeof preload === 'object' && preload !== null) {
			(preload instanceof Array ? preload : [preload]).forEach(item => {
				try {
					if (
						// Check if item is an object and not null/array
						typeof item !== 'object' ||
						item === null ||
						item instanceof Array ||
						// Check for 'icons' and 'prefix'
						typeof item.icons !== 'object' ||
						typeof item.prefix !== 'string' ||
						// Add icon set
						!addCollection(item)
					) {
						console.error(err);
					}
				} catch (e) {
					console.error(err);
				}
			});
		}
	}

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

/**
 * Component
 */
interface IconComponentData {
	data: Required<IconifyIcon>;
	classes?: string[];
}

export const Icon = defineComponent({
	// Do not inherit other attributes: it is handled by render()
	inheritAttrs: false,

	// Set initial data
	data() {
		return {
			// Mounted status
			mounted: false,

			// Callback counter to trigger re-render
			counter: 0,
		};
	},

	beforeMount() {
		// Current icon name
		this._name = '';

		// Loading
		this._loadingIcon = null;

		// Mark as mounted
		this.mounted = true;
	},

	unmounted() {
		this.abortLoading();
	},

	methods: {
		abortLoading() {
			if (this._loadingIcon) {
				this._loadingIcon.abort();
				this._loadingIcon = null;
			}
		},
		// Get data for icon to render or null
		getIcon(
			icon: IconifyIcon | string,
			onload?: IconifyIconOnLoad
		): IconComponentData | null {
			// Icon is an object
			if (
				typeof icon === 'object' &&
				icon !== null &&
				typeof icon.body === 'string'
			) {
				// Stop loading
				this._name = '';
				this.abortLoading();
				return {
					data: fullIcon(icon),
				};
			}

			// Invalid icon?
			let iconName: IconifyIconName | null;
			if (
				typeof icon !== 'string' ||
				(iconName = stringToIcon(icon, false, true)) === null
			) {
				this.abortLoading();
				return null;
			}

			// Load icon
			const data = getIconData(iconName);
			if (data === null) {
				// Icon needs to be loaded
				if (!this._loadingIcon || this._loadingIcon.name !== icon) {
					// New icon to load
					this.abortLoading();
					this._name = '';
					this._loadingIcon = {
						name: icon,
						abort: loadIcons([iconName], () => {
							this.counter++;
						}),
					};
				}
				return null;
			}

			// Icon data is available
			this.abortLoading();
			if (this._name !== icon) {
				this._name = icon;
				if (onload) {
					onload(icon);
				}
			}

			// Add classes
			const classes: string[] = ['iconify'];
			if (iconName.prefix !== '') {
				classes.push('iconify--' + iconName.prefix);
			}
			if (iconName.provider !== '') {
				classes.push('iconify--' + iconName.provider);
			}

			return { data, classes };
		},
	},

	// Render icon
	render() {
		if (!this.mounted) {
			return this.$slots.default ? this.$slots.default() : null;
		}

		// Re-render when counter changes
		this.counter;

		// Get icon data
		const props = this.$attrs;
		const icon: IconComponentData | null = this.getIcon(
			props.icon,
			props.onLoad
		);

		// Validate icon object
		if (!icon) {
			return this.$slots.default ? this.$slots.default() : null;
		}

		// Add classes
		let newProps = props;
		if (icon.classes) {
			newProps = {
				...props,
				class:
					(typeof props['class'] === 'string'
						? props['class'] + ' '
						: '') + icon.classes.join(' '),
			};
		}

		// Render icon
		return render(icon.data, newProps);
	},
});
