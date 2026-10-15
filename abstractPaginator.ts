const querystring = require('querystring');
const { range, is_null, is_object, count } = require('@ostro/support/function');
const Collection = require('@ostro/support/collection');
const { Macroable } = require('@ostro/support/macro');
class AbstractPaginator extends Macroable {

	$items;

	$perPage;

	$currentPage;

	$path = '/';

	$query = {};

	$fragment;

	$pageName = 'page';

	$onEachSide = 3;

	$options;

	$request;

	$currentPathResolver;

	$currentPageResolver;

	$queryStringResolver;

	static $viewFactoryResolver;

	static $defaultView = 'pagination::tailwind';

	static $defaultSimpleView = 'pagination::simple-tailwind';

	isValidPageNumber($page) {
		return $page >= 1 && Number.isInteger(parseInt($page)) !== false;
	}

	previousPageUrl() {
		if (this.currentPage() > 1) {
			return this.url(this.currentPage() - 1);
		}
	}

	getUrlRange($start, $end) {
		return new Collection(range($start, $end)).mapWithKeys(($page) => {
			return [$page, this.url($page)];
		}).all();
	}

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

	fragment($fragment = null) {
		if (is_null($fragment)) {
			return this.$fragment;
		}

		this.$fragment = $fragment;

		return this;
	}

	appends($key, $value = null) {
		if (is_null($key)) {
			return this;
		}

		if (is_object($key)) {
			return this.appendObject($key);
		}

		return this.addQuery($key, $value);
	}

	appendObject($keys = {}) {
		for (const key in $keys) {
			this.addQuery(key, $keys[key]);
		}

		return this;
	}

	withQueryString() {
		return this.appends(this.resolveQueryString());
	}

	addQuery($key, $value) {
		if ($key !== this.$pageName) {
			this.$query[$key] = $value;
		}

		return this;
	}

	buildFragment() {
		return this.$fragment ? '#' + this.$fragment : '';
	}

	loadMorph($relation, $relations) {
		this.getCollection().loadMorph($relation, $relations);

		return this;
	}

	loadMorphCount($relation, $relations) {
		this.getCollection().loadMorphCount($relation, $relations);

		return this;
	}

	items() {
		return this.$items.all();
	}

	firstItem() {
		return this.count() > 0 ? (this.$currentPage - 1) * this.$perPage + 1 : null;
	}

	lastItem() {
		return this.count() > 0 ? this.firstItem() + this.count() - 1 : null;
	}

	through($callback) {
		this.$items = this.$items.map($callback);

		return this;
	}

	perPage() {
		return this.$perPage;
	}

	hasPages() {
		return this.currentPage() != 1 || this.hasMorePages();
	}

	onFirstPage() {
		return this.currentPage() <= 1;
	}

	onLastPage() {
		return !this.hasMorePages();
	}

	currentPage() {
		return this.$currentPage;
	}

	getPageName() {
		return this.$pageName;
	}

	setPageName($name) {
		this.$pageName = $name;

		return this;
	}

	withPath($path) {
		return this.setPath($path);
	}

	setPath($path) {
		this.$path = $path;

		return this;
	}

	onEachSide($count) {
		this.$onEachSide = $count;

		return this;
	}

	path() {
		return this.$path;
	}

	resolveCurrentPath($default = '/') {
		if (!this.$request) return $default;
		if (typeof this.$request.url === 'function') return this.$request.url();
		if (typeof this.$request.url === 'string') return this.$request.url;
		if (typeof this.$request.path === 'function') return this.$request.path();
		return $default;
	}

	resolveCurrentPage($pageName = 'page', $default = 1) {
		const page = (this.$request && typeof this.$request.input === 'function') ? this.$request.input($pageName) : null;
		const parsedPage = parseInt(page, 10);
		if (!isNaN(parsedPage) && Number.isInteger(parsedPage) && parsedPage >= 1) {
			return parsedPage;
		}
		return $default;
	}

	resolveQueryString($default = null) {
		return (this.$request && typeof this.$request.getQuery === 'function') ? this.$request.getQuery() : $default;
	}

	viewFactory() {
		return this.constructor.viewFactory();
	}

	get $defaultView() {
		return this.constructor.$defaultView;
	}

	get $defaultSimpleView() {
		return this.constructor.$defaultSimpleView;
	}

	static viewFactory() {
		return this.$viewFactoryResolver();
	}

	static viewFactoryResolver($resolver) {
		this.$viewFactoryResolver = $resolver;
	}

	static defaultView($view) {
		this.$defaultView = $view;
	}

	static defaultSimpleView($view) {
		this.$defaultSimpleView = $view;
	}

	static useTailwind() {
		this.defaultView('pagination::tailwind');
		this.defaultSimpleView('pagination::simple-tailwind');
	}

	static useBootstrap() {
		this.useBootstrapFour();
	}


	static useBootstrapThree() {
		this.defaultView('pagination::default');
		this.defaultSimpleView('pagination::simple-default');
	}

	static useBootstrapFour() {
		this.defaultView('pagination::bootstrap-4');
		this.defaultSimpleView('pagination::simple-bootstrap-4');
	}

	static useBootstrapFive() {
		this.defaultView('pagination::bootstrap-5');
		this.defaultSimpleView('pagination::simple-bootstrap-5');
	}

	getIterator() {
		return typeof this.$items.getIterator === 'function'
			? this.$items.getIterator()
			: this.$items[Symbol.iterator]();
	}

	isEmpty() {
		return this.count() === 0;
	}

	isNotEmpty() {
		return this.count() > 0;
	}

	count() {
		return this.$items.count();
	}

	getCollection() {
		return this.$items;
	}

	setCollection($collection) {
		this.$items = $collection;

		return this;
	}

	getOptions() {
		return this.$options;
	}

	offsetExists($key) {
		return this.$items.has($key);
	}

	offsetGet($key) {
		const val = this.$items.get($key);
		return (val && typeof val.all === 'function') ? val.all() : val;
	}

	offsetSet($key, $value) {
		this.$items.put($key, $value);
	}

	offsetUnset($key) {
		if (Array.isArray(this.$items.$items)) {
			this.$items.$items.splice($key, 1);
		} else {
			delete this.$items[$key];
		}
	}

	toHtml() {
		return String(this.render());
	}

	__call($target, $method, $parameters) {
		return $target.getCollection()[$method](...$parameters);
	}

	__toString() {
		return String(this.render());
	}
}
module.exports = AbstractPaginator
