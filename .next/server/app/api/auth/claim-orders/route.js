"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/claim-orders/route";
exports.ids = ["app/api/auth/claim-orders/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fclaim-orders%2Froute&page=%2Fapi%2Fauth%2Fclaim-orders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fclaim-orders%2Froute.js&appDir=C%3A%5Cfreshdrop%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cfreshdrop&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fclaim-orders%2Froute&page=%2Fapi%2Fauth%2Fclaim-orders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fclaim-orders%2Froute.js&appDir=C%3A%5Cfreshdrop%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cfreshdrop&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_freshdrop_app_api_auth_claim_orders_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/claim-orders/route.js */ \"(rsc)/./app/api/auth/claim-orders/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/claim-orders/route\",\n        pathname: \"/api/auth/claim-orders\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/claim-orders/route\"\n    },\n    resolvedPagePath: \"C:\\\\freshdrop\\\\app\\\\api\\\\auth\\\\claim-orders\\\\route.js\",\n    nextConfigOutput,\n    userland: C_freshdrop_app_api_auth_claim_orders_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/claim-orders/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGY2xhaW0tb3JkZXJzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoJTJGY2xhaW0tb3JkZXJzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXV0aCUyRmNsYWltLW9yZGVycyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDZnJlc2hkcm9wJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDZnJlc2hkcm9wJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNLO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZnJlc2hkcm9wLz9mOTE4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXGZyZXNoZHJvcFxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcY2xhaW0tb3JkZXJzXFxcXHJvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL2NsYWltLW9yZGVycy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvY2xhaW0tb3JkZXJzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL2NsYWltLW9yZGVycy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXGZyZXNoZHJvcFxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcY2xhaW0tb3JkZXJzXFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL2NsYWltLW9yZGVycy9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fclaim-orders%2Froute&page=%2Fapi%2Fauth%2Fclaim-orders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fclaim-orders%2Froute.js&appDir=C%3A%5Cfreshdrop%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cfreshdrop&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/claim-orders/route.js":
/*!********************************************!*\
  !*** ./app/api/auth/claim-orders/route.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabase_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabase/server */ \"(rsc)/./lib/supabase/server.js\");\n\n\nasync function POST() {\n    const supabase = (0,_lib_supabase_server__WEBPACK_IMPORTED_MODULE_1__.createSupabaseServerClient)();\n    const { data: { user } } = await supabase.auth.getUser();\n    if (!user) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Inte inloggad.\"\n        }, {\n            status: 401\n        });\n    }\n    const email = user.email;\n    if (!email) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Anv\\xe4ndaren saknar e-post.\"\n        }, {\n            status: 400\n        });\n    }\n    const { error } = await supabase.from(\"orders\").update({\n        user_id: user.id\n    }).is(\"user_id\", null).eq(\"customer_email\", email);\n    if (error) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            message: \"Kunde inte koppla g\\xe4stbest\\xe4llningar.\"\n        }, {\n            status: 500\n        });\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: true\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvY2xhaW0tb3JkZXJzL3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEyQztBQUN3QjtBQUU1RCxlQUFlRTtJQUNwQixNQUFNQyxXQUFXRixnRkFBMEJBO0lBRTNDLE1BQU0sRUFDSkcsTUFBTSxFQUFFQyxJQUFJLEVBQUUsRUFDZixHQUFHLE1BQU1GLFNBQVNHLElBQUksQ0FBQ0MsT0FBTztJQUUvQixJQUFJLENBQUNGLE1BQU07UUFDVCxPQUFPTCxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQUVDLFNBQVM7UUFBaUIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDeEU7SUFFQSxNQUFNQyxRQUFRTixLQUFLTSxLQUFLO0lBQ3hCLElBQUksQ0FBQ0EsT0FBTztRQUNWLE9BQU9YLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUE0QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNuRjtJQUVBLE1BQU0sRUFBRUUsS0FBSyxFQUFFLEdBQUcsTUFBTVQsU0FDckJVLElBQUksQ0FBQyxVQUNMQyxNQUFNLENBQUM7UUFBRUMsU0FBU1YsS0FBS1csRUFBRTtJQUFDLEdBQzFCQyxFQUFFLENBQUMsV0FBVyxNQUNkQyxFQUFFLENBQUMsa0JBQWtCUDtJQUV4QixJQUFJQyxPQUFPO1FBQ1QsT0FBT1oscURBQVlBLENBQUNRLElBQUksQ0FDdEI7WUFBRUMsU0FBUztRQUF1QyxHQUNsRDtZQUFFQyxRQUFRO1FBQUk7SUFFbEI7SUFFQSxPQUFPVixxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVXLFNBQVM7SUFBSztBQUMzQyIsInNvdXJjZXMiOlsid2VicGFjazovL2ZyZXNoZHJvcC8uL2FwcC9hcGkvYXV0aC9jbGFpbS1vcmRlcnMvcm91dGUuanM/M2UzNyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgY3JlYXRlU3VwYWJhc2VTZXJ2ZXJDbGllbnQgfSBmcm9tIFwiQC9saWIvc3VwYWJhc2Uvc2VydmVyXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVCgpIHtcclxuICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZVN1cGFiYXNlU2VydmVyQ2xpZW50KCk7XHJcblxyXG4gIGNvbnN0IHtcclxuICAgIGRhdGE6IHsgdXNlciB9XHJcbiAgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpO1xyXG5cclxuICBpZiAoIXVzZXIpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6IFwiSW50ZSBpbmxvZ2dhZC5cIiB9LCB7IHN0YXR1czogNDAxIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZW1haWwgPSB1c2VyLmVtYWlsO1xyXG4gIGlmICghZW1haWwpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IG1lc3NhZ2U6IFwiQW52w6RuZGFyZW4gc2FrbmFyIGUtcG9zdC5cIiB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgIC5mcm9tKFwib3JkZXJzXCIpXHJcbiAgICAudXBkYXRlKHsgdXNlcl9pZDogdXNlci5pZCB9KVxyXG4gICAgLmlzKFwidXNlcl9pZFwiLCBudWxsKVxyXG4gICAgLmVxKFwiY3VzdG9tZXJfZW1haWxcIiwgZW1haWwpO1xyXG5cclxuICBpZiAoZXJyb3IpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBtZXNzYWdlOiBcIkt1bmRlIGludGUga29wcGxhIGfDpHN0YmVzdMOkbGxuaW5nYXIuXCIgfSxcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZVN1cGFiYXNlU2VydmVyQ2xpZW50IiwiUE9TVCIsInN1cGFiYXNlIiwiZGF0YSIsInVzZXIiLCJhdXRoIiwiZ2V0VXNlciIsImpzb24iLCJtZXNzYWdlIiwic3RhdHVzIiwiZW1haWwiLCJlcnJvciIsImZyb20iLCJ1cGRhdGUiLCJ1c2VyX2lkIiwiaWQiLCJpcyIsImVxIiwic3VjY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/claim-orders/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/supabase/server.js":
/*!********************************!*\
  !*** ./lib/supabase/server.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createSupabaseServerClient: () => (/* binding */ createSupabaseServerClient)\n/* harmony export */ });\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n/* harmony import */ var _supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/auth-helpers-nextjs */ \"(rsc)/./node_modules/@supabase/auth-helpers-nextjs/dist/index.js\");\n/* harmony import */ var _supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1__);\n\n\nfunction createSupabaseServerClient() {\n    const cookieStore = (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)();\n    return (0,_supabase_auth_helpers_nextjs__WEBPACK_IMPORTED_MODULE_1__.createServerComponentClient)({\n        cookies: ()=>cookieStore\n    }, {\n        supabaseUrl: \"https://huuheyuqbmrpdiwoilfc.supabase.co\",\n        supabaseKey: \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dWhleXVxYm1ycGRpd29pbGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDkwMjMsImV4cCI6MjA4NTA4NTAyM30.zAtl7sxyTd57EO3Ov0UYQLpO1qgTyzApHQjXAFdIrmU\"\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2Uvc2VydmVyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBdUM7QUFDcUM7QUFFckUsU0FBU0U7SUFDZCxNQUFNQyxjQUFjSCxxREFBT0E7SUFFM0IsT0FBT0MsMEZBQTJCQSxDQUNoQztRQUFFRCxTQUFTLElBQU1HO0lBQVksR0FDN0I7UUFDRUMsYUFBYUMsMENBQW9DO1FBQ2pERyxhQUFhSCxrTkFBeUM7SUFDeEQ7QUFFSiIsInNvdXJjZXMiOlsid2VicGFjazovL2ZyZXNoZHJvcC8uL2xpYi9zdXBhYmFzZS9zZXJ2ZXIuanM/MDg2NCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb29raWVzIH0gZnJvbSBcIm5leHQvaGVhZGVyc1wiO1xyXG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXJDb21wb25lbnRDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL2F1dGgtaGVscGVycy1uZXh0anNcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdXBhYmFzZVNlcnZlckNsaWVudCgpIHtcclxuICBjb25zdCBjb29raWVTdG9yZSA9IGNvb2tpZXMoKTtcclxuXHJcbiAgcmV0dXJuIGNyZWF0ZVNlcnZlckNvbXBvbmVudENsaWVudChcclxuICAgIHsgY29va2llczogKCkgPT4gY29va2llU3RvcmUgfSxcclxuICAgIHtcclxuICAgICAgc3VwYWJhc2VVcmw6IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCxcclxuICAgICAgc3VwYWJhc2VLZXk6IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZXHJcbiAgICB9XHJcbiAgKTtcclxufVxyXG4iXSwibmFtZXMiOlsiY29va2llcyIsImNyZWF0ZVNlcnZlckNvbXBvbmVudENsaWVudCIsImNyZWF0ZVN1cGFiYXNlU2VydmVyQ2xpZW50IiwiY29va2llU3RvcmUiLCJzdXBhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzdXBhYmFzZUtleSIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase/server.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@supabase","vendor-chunks/next","vendor-chunks/tslib","vendor-chunks/iceberg-js","vendor-chunks/set-cookie-parser","vendor-chunks/jose"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fclaim-orders%2Froute&page=%2Fapi%2Fauth%2Fclaim-orders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fclaim-orders%2Froute.js&appDir=C%3A%5Cfreshdrop%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5Cfreshdrop&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();