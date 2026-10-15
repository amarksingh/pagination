const querystring = require('querystring');
const { range, is_null, is_object, count } = require('@ostro/support/function');
const Collection = require('@ostro/support/collection');
const { Macroable } = require('@ostro/support/macro');
class AbstractPaginator extends Macroable {

	/**
	 * $items property.
	 * @type {any}
	 */
	$items;

	/**
	 * $perPage property.
	 * @type {any}
	 */
	$perPage;

	/**
	 * $currentPage property.
	 * @type {any}
	 */
	$currentPage;

	/**
	 * $path property.
	 * @type {any}
	 */
	$path = '/';

	/**
	 * $query property.
	 * @type {any}
	 */
	$query = {};

	/**
	 * $fragment property.
	 * @type {any}
	 */
	$fragment;

	/**
	 * $pageName property.
	 * @type {any}
	 */
	$pageName = 'page';

	/**
	 * $onEachSide property.
	 * @type {any}
	 */
	$onEachSide = 3;

	/**
	 * $options property.
	 * @type {any}
	 */
	$options;

	/**
	 * $request property.
	 * @type {any}
	 */
	$request;

	/**
	 * $currentPathResolver property.
	 * @type {any}
	 */
	$currentPathResolver;

	/**
	 * $currentPageResolver property.
	 * @type {any}
	 */
	$currentPageResolver;

	/**
	 * $queryStringResolver property.
	 * @type {any}
	 */
	$queryStringResolver;

	static $viewFactoryResolver;

	static $defaultView = 'pagination::tailwind';

	static $defaultSimpleView = 'pagination::simple-tailwind';

	/**
	 * isValidPageNumber method.
	 *
	 * @param {any} page
	 * @returns {any}
	 */
	isValidPageNumber($page) {
		return $page >= 1 && Number.isInteger(parseInt($page)) !== false;
	}

	/**
	 * previousPageUrl method.
	 *
	 * @returns {any}
	 */
	previousPageUrl() {
		if (this.currentPage() > 1) {
			return this.url(this.currentPage() - 1);
		}
	}

	/**
	 * getUrlRange method.
	 *
	 * @param {any} start
	 * @param {any} end
	 * @returns {any}
	 */
	getUrlRange($start, $end) {
		return new Collection(range($start, $end)).mapWithKeys(($page) => {
			return [$page, this.url($page)];
		}).all();
	}

	/**
	 * url method.
	 *
	 * @param {any} page
	 * @returns {any}
	 */
	url($page) {
		if ($page <= 0) {
			$page = 1;
		}

		const $parameters = { [this.$pageName]: $page };

		if (count(this.$query) > 0) {
			Object.assign($parameters, this.$query);
		}

		return this.path()
			+ (this.path().includes('?') ? '&' : '?')
			+ querystring.stringify($parameters)
			+ this.buildFragment();
	}

	/**
	 * fragment method.
	 *
	 * @param {any} fragment
	 * @returns {any}
	 */
	fragment($fragment = null) {
		if (is_null($fragment)) {
			return this.$fragment;
		}

		this.$fragment = $fragment;

		return this;
	}

	/**
	 * appends method.
	 *
	 * @param {any} key
	 * @param {any} value
	 * @returns {any}
	 */
	appends($key, $value = null) {
		if (is_null($key)) {
			return this;
		}

		if (is_object($key)) {
			return this.appendObject($key);
		}

		return this.addQuery($key, $value);
	}

	/**
	 * appendObject method.
	 *
	 * @param {any} keys
	 * @returns {any}
	 */
	appendObject($keys = {}) {
		for (const key in $keys) {
			this.addQuery(key, $keys[key]);
		}

		return this;
	}

	/**
	 * withQueryString method.
	 *
	 * @returns {any}
	 */
	withQueryString() {
		return this.appends(this.resolveQueryString());
	}

	/**
	 * addQuery method.
	 *
	 * @param {any} key
	 * @param {any} value
	 * @returns {any}
	 */
	addQuery($key, $value) {
		if ($key !== this.$pageName) {
			this.$query[$key] = $value;
		}

		return this;
	}

	/**
	 * buildFragment method.
	 *
	 * @returns {any}
	 */
	buildFragment() {
		return this.$fragment ? '#' + this.$fragment : '';
	}

	/**
	 * loadMorph method.
	 *
	 * @param {any} relation
	 * @param {any} relations
	 * @returns {any}
	 */
	loadMorph($relation, $relations) {
		this.getCollection().loadMorph($relation, $relations);

		return this;
	}

	/**
	 * loadMorphCount method.
	 *
	 * @param {any} relation
	 * @param {any} relations
	 * @returns {any}
	 */
	loadMorphCount($relation, $relations) {
		this.getCollection().loadMorphCount($relation, $relations);

		return this;
	}

	/**
	 * items method.
	 *
	 * @returns {any}
	 */
	items() {
		return this.$items.all();
	}

	/**
	 * firstItem method.
	 *
	 * @returns {any}
	 */
	firstItem() {
		return this.count() > 0 ? (this.$currentPage - 1) * this.$perPage + 1 : null;
	}

	/**
	 * lastItem method.
	 *
	 * @returns {any}
	 */
	lastItem() {
		return this.count() > 0 ? this.firstItem() + this.count() - 1 : null;
	}

	/**
	 * through method.
	 *
	 * @param {any} callback
	 * @returns {any}
	 */
	through($callback) {
		this.$items = this.$items.map($callback);

		return this;
	}

	/**
	 * perPage method.
	 *
	 * @returns {any}
	 */
	perPage() {
		return this.$perPage;
	}

	/**
	 * hasPages method.
	 *
	 * @returns {any}
	 */
	hasPages() {
		return this.currentPage() != 1 || this.hasMorePages();
	}

	/**
	 * onFirstPage method.
	 *
	 * @returns {any}
	 */
	onFirstPage() {
		return this.currentPage() <= 1;
	}

	/**
	 * onLastPage method.
	 *
	 * @returns {any}
	 */
	onLastPage() {
		return !this.hasMorePages();
	}

	/**
	 * currentPage method.
	 *
	 * @returns {any}
	 */
	currentPage() {
		return this.$currentPage;
	}

	/**
	 * getPageName method.
	 *
	 * @returns {any}
	 */
	getPageName() {
		return this.$pageName;
	}

	/**
	 * setPageName method.
	 *
	 * @param {any} name
	 * @returns {any}
	 */
	setPageName($name) {
		this.$pageName = $name;

		return this;
	}

	/**
	 * withPath method.
	 *
	 * @param {any} path
	 * @returns {any}
	 */
	withPath($path) {
		return this.setPath($path);
	}

	/**
	 * setPath method.
	 *
	 * @param {any} path
	 * @returns {any}
	 */
	setPath($path) {
		this.$path = $path;

		return this;
	}

	/**
	 * onEachSide method.
	 *
	 * @param {any} count
	 * @returns {any}
	 */
	onEachSide($count) {
		this.$onEachSide = $count;

		return this;
	}

	/**
	 * path method.
	 *
	 * @returns {any}
	 */
	path() {
		return this.$path;
	}

	/**
	 * resolveCurrentPath method.
	 *
	 * @param {any} default
	 * @returns {any}
	 */
	resolveCurrentPath($default = '/') {
		if (!this.$request) return $default;
		if (typeof this.$request.url === 'function') return this.$request.url();
		if (typeof this.$request.url === 'string') return this.$request.url;
		if (typeof this.$request.path === 'function') return this.$request.path();
		return $default;
	}

	/**
	 * resolveCurrentPage method.
	 *
	 * @param {any} pageName
	 * @param {any} default
	 * @returns {any}
	 */
	resolveCurrentPage($pageName = 'page', $default = 1) {
		const page = (this.$request && typeof this.$request.input === 'function') ? this.$request.input($pageName) : null;
		const parsedPage = parseInt(page, 10);
		if (!isNaN(parsedPage) && Number.isInteger(parsedPage) && parsedPage >= 1) {
			return parsedPage;
		}
		return $default;
	}

	/**
	 * resolveQueryString method.
	 *
	 * @param {any} default
	 * @returns {any}
	 */
	resolveQueryString($default = null) {
		return (this.$request && typeof this.$request.getQuery === 'function') ? this.$request.getQuery() : $default;
	}

	/**
	 * viewFactory method.
	 *
	 * @returns {any}
	 */
	viewFactory() {
		return this.constructor.viewFactory();
	}

	get $defaultView() {
		return this.constructor.$defaultView;
	}

	get $defaultSimpleView() {
		return this.constructor.$defaultSimpleView;
	}

	/**
	 * viewFactory method.
	 *
	 * @static
	 * @returns {any}
	 */
	static viewFactory() {
		return this.$viewFactoryResolver();
	}

	/**
	 * viewFactoryResolver method.
	 *
	 * @static
	 * @param {any} resolver
	 * @returns {any}
	 */
	static viewFactoryResolver($resolver) {
		this.$viewFactoryResolver = $resolver;
	}

	/**
	 * defaultView method.
	 *
	 * @static
	 * @param {any} view
	 * @returns {any}
	 */
	static defaultView($view) {
		this.$defaultView = $view;
	}

	/**
	 * defaultSimpleView method.
	 *
	 * @static
	 * @param {any} view
	 * @returns {any}
	 */
	static defaultSimpleView($view) {
		this.$defaultSimpleView = $view;
	}

	/**
	 * useTailwind method.
	 *
	 * @static
	 * @returns {any}
	 */
	static useTailwind() {
		this.defaultView('pagination::tailwind');
		this.defaultSimpleView('pagination::simple-tailwind');
	}

	/**
	 * useBootstrap method.
	 *
	 * @static
	 * @returns {any}
	 */
	static useBootstrap() {
		this.useBootstrapFour();
	}


	/**
	 * useBootstrapThree method.
	 *
	 * @static
	 * @returns {any}
	 */
	static useBootstrapThree() {
		this.defaultView('pagination::default');
		this.defaultSimpleView('pagination::simple-default');
	}

	/**
	 * useBootstrapFour method.
	 *
	 * @static
	 * @returns {any}
	 */
	static useBootstrapFour() {
		this.defaultView('pagination::bootstrap-4');
		this.defaultSimpleView('pagination::simple-bootstrap-4');
	}

	/**
	 * useBootstrapFive method.
	 *
	 * @static
	 * @returns {any}
	 */
	static useBootstrapFive() {
		this.defaultView('pagination::bootstrap-5');
		this.defaultSimpleView('pagination::simple-bootstrap-5');
	}

	/**
	 * getIterator method.
	 *
	 * @returns {any}
	 */
	getIterator() {
		return typeof this.$items.getIterator === 'function'
			? this.$items.getIterator()
			: this.$items[Symbol.iterator]();
	}

	/**
	 * isEmpty method.
	 *
	 * @returns {any}
	 */
	isEmpty() {
		return this.count() === 0;
	}

	/**
	 * isNotEmpty method.
	 *
	 * @returns {any}
	 */
	isNotEmpty() {
		return this.count() > 0;
	}

	/**
	 * count method.
	 *
	 * @returns {any}
	 */
	count() {
		return this.$items.count();
	}

	/**
	 * getCollection method.
	 *
	 * @returns {any}
	 */
	getCollection() {
		return this.$items;
	}

	/**
	 * setCollection method.
	 *
	 * @param {any} collection
	 * @returns {any}
	 */
	setCollection($collection) {
		this.$items = $collection;

		return this;
	}

	/**
	 * getOptions method.
	 *
	 * @returns {any}
	 */
	getOptions() {
		return this.$options;
	}

	/**
	 * offsetExists method.
	 *
	 * @param {any} key
	 * @returns {any}
	 */
	offsetExists($key) {
		return this.$items.has($key);
	}

	/**
	 * offsetGet method.
	 *
	 * @param {any} key
	 * @returns {any}
	 */
	offsetGet($key) {
		const val = this.$items.get($key);
		return (val && typeof val.all === 'function') ? val.all() : val;
	}

	/**
	 * offsetSet method.
	 *
	 * @param {any} key
	 * @param {any} value
	 * @returns {any}
	 */
	offsetSet($key, $value) {
		this.$items.put($key, $value);
	}

	/**
	 * offsetUnset method.
	 *
	 * @param {any} key
	 * @returns {any}
	 */
	offsetUnset($key) {
		if (Array.isArray(this.$items.$items)) {
			this.$items.$items.splice($key, 1);
		} else {
			delete this.$items[$key];
		}
	}

	/**
	 * toHtml method.
	 *
	 * @returns {any}
	 */
	toHtml() {
		return String(this.render());
	}

	/**
	 * __call method.
	 *
	 * @param {any} target
	 * @param {any} method
	 * @param {any} parameters
	 * @returns {any}
	 */
	__call($target, $method, $parameters) {
		return $target.getCollection()[$method](...$parameters);
	}

	/**
	 * __toString method.
	 *
	 * @returns {any}
	 */
	__toString() {
		return String(this.render());
	}
}
module.exports = AbstractPaginator
