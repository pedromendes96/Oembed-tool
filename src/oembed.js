import SERVICES from "./services";
import "./index.css";
import { debounce } from "debounce";

/**
 * @typedef {Object} EmbedData
 * @description Embed Tool data
 * @property {string} service - service name
 * @property {string} url - source URL of embedded content
 * @property {string} embed - URL to source embed page
 * @property {number} [width] - embedded content width
 * @property {number} [height] - embedded content height
 * @property {string} [caption] - content caption
 *
 * @typedef {Object} Service
 * @description Service configuration object
 * @property {RegExp} regex - pattern of source URLs
 * @property {string} embedUrl - URL scheme to embedded page. Use '<%= remote_id %>' to define a place to insert resource id
 * @property {string} html - iframe which contains embedded content
 * @property {number} [height] - iframe height
 * @property {number} [width] - iframe width
 * @property {Function} [id] - function to get resource id from RegExp groups
 *
 * @typedef {Object} EmbedConfig
 * @description Embed tool configuration object
 * @property {Object} [services] - additional services provided by user. Each property should contain Service object
 */

/**
 * @class Embed
 * @classdesc Embed Tool for Editor.js 2.0
 *
 * @property {Object} api - Editor.js API
 * @property {EmbedData} _data - private property with Embed data
 * @property {HTMLElement} element - embedded content container
 *
 * @property {Object} services - static property with available services
 * @property {Object} patterns - static property with patterns for paste handling configuration
 */
export default class OEmbed {
                 /**
                  * @param {{data: EmbedData, config: EmbedConfig, api: object}}
                  *   data — previously saved data
                  *   config - user config for Tool
                  *   api - Editor.js API
                  */
                 constructor({ data, api, config }) {
                   this.api = api;
                   this._data = {};
                   this.element = null;
                   this.config = config;
                   this.serverOembedUrl = config.serverOembedUrl || null;
                   this.data = data;
                 }

                 /**
                  * @param {EmbedData} data
                  * @param {RegExp} [data.regex] - pattern of source URLs
                  * @param {string} [data.embedUrl] - URL scheme to embedded page. Use '<%= remote_id %>' to define a place to insert resource id
                  * @param {string} [data.html] - iframe which contains embedded content
                  * @param {number} [data.height] - iframe height
                  * @param {number} [data.width] - iframe width
                  * @param {string} [data.caption] - caption
                  */
                 set data(data) {
                   if (!(data instanceof Object)) {
                     throw Error("Embed Tool data should be object");
                   }

                   const {
                     service,
                     source,
                     embed,
                     width,
                     height,
                     html,
                     caption = ""
                   } = data;

                   this._data = {
                     service: service || this.data.service,
                     source: source || this.data.source,
                     embed: embed || this.data.embed,
                     width: width || this.data.width,
                     height: height || this.data.height,
                     html: html || this.data.html,
                     caption: this.data.caption || caption
                   };

                   const oldView = this.element;

                   if (oldView) {
                     oldView.parentNode.replaceChild(this.render(), oldView);
                   }
                 }

                 /**
                  * @return {EmbedData}
                  */
                 get data() {
                   if (this.element) {
                     const caption = this.element.querySelector(
                       `.${this.api.styles.input}`
                     );

                     this._data.caption = caption
                       ? caption.innerHTML
                       : this._data.caption;
                   }

                   return this._data;
                 }

                 /**
                  * Get plugin styles
                  * @return {Object}
                  */
                 get CSS() {
                   return {
                     baseClass: this.api.styles.block,
                     input: this.api.styles.input,
                     container: "embed-tool",
                     containerLoading: "embed-tool--loading",
                     preloader: "embed-tool__preloader",
                     caption: "embed-tool__caption",
                     url: "embed-tool__url",
                     content: "embed-tool__content"
                   };
                 }

                 /**
                  * Render Embed tool content
                  *
                  * @return {HTMLElement}
                  */
                 render() {
                   if (!this.data.service) {
                     const container = document.createElement("div");

                     this.element = container;

                     return container;
                   }

                   const html = OEmbed.services[this.data.service].html;
                   const container = document.createElement("div");
                   const caption = document.createElement("div");
                   const template = document.createElement("template");
                   const preloader = this.createPreloader();

                   container.classList.add(
                     this.CSS.baseClass,
                     this.CSS.container,
                     this.CSS.containerLoading
                   );
                   caption.classList.add(this.CSS.input, this.CSS.caption);

                   container.appendChild(preloader);

                   caption.contentEditable = true;
                   caption.dataset.placeholder = "Enter a caption";
                   caption.innerHTML = this.data.caption || "";

                   if (html) {
                     template.innerHTML = html;
                     var firstChildren = template.content.firstChild;
                     if (firstChildren.tagName == "IFRAME") {
                       firstChildren.setAttribute("src", this.data.embed);
                     } else if (firstChildren.tagName == "A") {
                       firstChildren.setAttribute("href", this.data.embed);
                     }
                   } else {
                     template.innerHTML = this.data.html;
                   }
                   var templateContentChildren = Array.from(template.content.children);
                   var loadScripts = [];
                   for (let index = 0; index < templateContentChildren.length; index++) {
                     const element = templateContentChildren[index];
                     if(element.tagName == "SCRIPT"){
                       loadScripts.push(element);
                     }else{
                       element.classList.add(this.CSS.content);
                       container.appendChild(element);
                     }
                   }

                   for (let index = 0; index < loadScripts.length; index++) {
                     const element = loadScripts[index];
                     var script = document.createElement("script");
                     script.setAttribute("src", element.getAttribute("src"));
                     document.body.append(script);
                   }

                   const embedIsReady = this.embedIsReady(container);
                   embedIsReady.then(() => {
                     container.classList.remove(this.CSS.containerLoading);
                   });

                   container.appendChild(caption);

                   this.element = container;

                   return container;
                 }

                 /**
                  * Creates preloader to append to container while data is loading
                  * @return {HTMLElement} preloader
                  */
                 createPreloader() {
                   const preloader = document.createElement("preloader");
                   const url = document.createElement("div");

                   url.textContent = this.data.source;

                   preloader.classList.add(this.CSS.preloader);
                   url.classList.add(this.CSS.url);

                   preloader.appendChild(url);

                   return preloader;
                 }

                 /**
                  * Save current content and return EmbedData object
                  *
                  * @return {EmbedData}
                  */
                 save() {
                   console.log(this.data);
                   return this.data;
                 }

                 /**
                  * Handle pasted url and return Service object
                  *
                  * @param {PasteEvent} event- event with pasted data
                  * @return {Service}
                  */

                 onPaste(event) {
                   const { key: service, data: url } = event.detail;
                   const serviceInfo = OEmbed.services[service];

                   if (serviceInfo.embedUrl) {
                     const {
                       regex,
                       embedUrl,
                       width,
                       height,
                       id = ids => ids.shift()
                     } = serviceInfo;

                     const result = regex.exec(url).slice(1);
                     const embed = embedUrl.replace(
                       /<\%\= remote\_id \%\>/g,
                       id(result)
                     );

                     this.data = {
                       service,
                       source: url,
                       embed,
                       width,
                       height
                     };
                   } else if (serviceInfo.oembedUrl) {
                     if (serviceInfo.useServerSide && this.serverOembedUrl) {
                       var params = {
                         oembedUrl : serviceInfo.oembedUrl,
                         url: url
                       };
                       var queryString = Object.keys(params)
                         .map(key => key + "=" + params[key])
                         .join("&");
                       fetchUrl = this.serverOembedUrl + "?" + queryString;
                     } else {
                       var params = {
                         url: url
                       };
                       var queryString = Object.keys(params)
                         .map(key => key + "=" + params[key])
                         .join("&");
                       fetchUrl = serviceInfo.oembedUrl + "?" + queryString;
                     }
                     fetch(fetchUrl).then(async response => {
                       var responseData = await response.json();

                       var html = responseData.html;
                       var width = responseData.width;
                       var height = responseData.height;
                       var caption = responseData.title;
                       this.data = {
                         service: service,
                         source: url,
                         html: html,
                         width: width,
                         height: height,
                         caption: caption
                       };
                     });
                   }
                 }

                 /**
                  * Analyze provided config and make object with services to use
                  *
                  * @param {EmbedConfig} config
                  */
                 static prepare({ config = {} }) {
                   let { services = {} } = config;

                   let entries = Object.entries(SERVICES);

                   const enabledServices = Object.entries(services)
                     .filter(([key, value]) => {
                       return typeof value === "boolean" && value === true;
                     })
                     .map(([key]) => key);

                   const userServices = Object.entries(services)
                     .filter(([key, value]) => {
                       return typeof value === "object";
                     })
                     .filter(([key, service]) =>
                       OEmbed.checkServiceConfig(service)
                     )
                     .map(([key, service]) => {
                       const {
                         regex,
                         embedUrl,
                         html,
                         height,
                         width,
                         oembedUrl,
                         id
                       } = service;
                       var data = [
                         key,
                         {
                           regex,
                           embedUrl,
                           oembedUrl,
                           html,
                           height,
                           width,
                           id
                         }
                       ];
                       return data;
                     });

                   if (enabledServices.length) {
                     entries = entries.filter(([key]) =>
                       enabledServices.includes(key)
                     );
                   }

                   entries = entries.concat(userServices);

                   OEmbed.services = entries.reduce(
                     (result, [key, service]) => {
                       if (!(key in result)) {
                         result[key] = service;
                         return result;
                       }

                       result[key] = Object.assign({}, result[key], service);
                       return result;
                     },
                     {}
                   );

                   OEmbed.patterns = entries.reduce((result, [key, item]) => {
                     result[key] = item.regex;

                     return result;
                   }, {});
                 }

                 /**
                  * Check if Service config is valid
                  *
                  * @param {Service} config
                  * @return {boolean}
                  */
                 static checkServiceConfig(config) {
                   const {
                     regex,
                     embedUrl,
                     html,
                     height,
                     width,
                     id,
                     oembedUrl
                   } = config;

                   var isValidRegex = false;
                   var isValidEmbedUrl = false;
                   var isValidOEmbedUrl = false;
                   var isValid = false;

                   if (regex && regex instanceof RegExp) {
                     isValidRegex = true;
                   }
                   if (
                     embedUrl &&
                     typeof embedUrl === "string" &&
                     html &&
                     typeof html === "string"
                   ) {
                     isValidEmbedUrl = true;
                   }
                   if (oembedUrl && typeof oembedUrl === "string") {
                     isValidOEmbedUrl = true;
                   }

                   isValid =
                     isValidRegex && (isValidEmbedUrl || isValidOEmbedUrl);
                   isValid =
                     isValid &&
                     (id !== undefined ? id instanceof Function : true);
                   isValid =
                     isValid &&
                     (height !== undefined ? Number.isFinite(height) : true);
                   isValid =
                     isValid &&
                     (width !== undefined ? Number.isFinite(width) : true);
                   return isValid;
                 }

                 /**
                  * Paste configuration to enable pasted URLs processing by Editor
                  */
                 static get pasteConfig() {
                   return {
                     patterns: OEmbed.patterns
                   };
                 }

                 /**
                  * Checks that mutations in DOM have finished after appending iframe content
                  * @param {HTMLElement} targetNode - HTML-element mutations of which to listen
                  * @return {Promise<any>} - result that all mutations have finished
                  */
                 embedIsReady(targetNode) {
                   const PRELOADER_DELAY = 1000;

                   let observer = null;

                   return new Promise((resolve, reject) => {
                     observer = new MutationObserver(
                       debounce(resolve, PRELOADER_DELAY)
                     );
                     console.log(targetNode);
                     debugger;
                     observer.observe(targetNode, {
                       childList: true,
                       subtree: true
                     });
                   }).then(() => {
                     observer.disconnect();
                   });
                 }
               }
