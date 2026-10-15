
const AbstractPaginator = require('./abstractPaginator');
const Collection = require('@ostro/support/collection');
const { rtrim } = require('@ostro/support/function')
class Paginator extends AbstractPaginator {

	/**
	 * $hasMore property.
	 * @type {any}
	 */
	$hasMore;

	/**
	 * constructor method.
	 *
	 * @param {any} items
	 * @param {any} perPage
	 * @param {any} currentPage
	 * @param {any} options
	 * @param {any} request
	 * @returns {any}
	 */
	constructor($items: any[], $perPage: number, $currentPage: any = null, $options: Record<string, any> = {}, $request: Record<string, any> = {}) {
		super();
		this.$options = $options;
		this.$request = $request;
		for (let $key in $options) {
			this[$key] = $options[$key];
		}

		this.$perPage = $perPage;
		this.$currentPage = this.setCurrentPage($currentPage);
		this.$path = this.$path !== '/' ? rtrim(this.$path, '/') : this.$path;

		this.setItems($items);
	}

	/**
	 * setCurrentPage method.
	 *
	 * @param {any} currentPage
	 * @returns {any}
	 */
	setCurrentPage($currentPage: any) {
		$currentPage = $currentPage || this.resolveCurrentPage();

		return this.isValidPageNumber($currentPage) ? parseInt($currentPage) : 1;
	}

	/**
	 * setItems method.
	 *
	 * @param {any} items
	 * @returns {any}
	 */
	setItems($items: any[]) {
		this.$items = $items instanceof Collection ? $items : Collection.make($items);

		this.$hasMore = this.$items.count() > this.$perPage;

		this.$items = this.$items.slice(0, this.$perPage);
	}

	/**
	 * nextPageUrl method.
	 *
	 * @returns {any}
	 */
	nextPageUrl() {
		if (this.hasMorePages()) {
			return this.url(this.currentPage() + 1);
		}
	}

	/**
	 * nextPage method.
	 *
	 * @returns {any}
	 */
	nextPage() {
		if (this.hasMorePages()) {
			return this.currentPage() + 1;
		}
	}

	/**
	 * links method.
	 *
	 * @param {any} view
	 * @param {any} data
	 * @returns {any}
	 */
	links($view: any = null, $data: Record<string, any> = {}) {
		return this.render($view, $data);
	}

	/**
	 * render method.
	 *
	 * @param {any} view
	 * @param {any} data
	 * @returns {any}
	 */
	render($view: any = null, $data: Record<string, any> = {}) {
		return this.viewFactory().make($view || this.$defaultSimpleView, Object.assign($data, {
			'paginator': this,
		}));
	}

	/**
	 * hasMorePagesWhen method.
	 *
	 * @param {any} hasMore
	 * @returns {any}
	 */
	hasMorePagesWhen($hasMore: boolean = true) {
		this.$hasMore = $hasMore;

		return this;
	}

	/**
	 * hasMorePages method.
	 *
	 * @returns {any}
	 */
	hasMorePages() {
		return this.$hasMore;
	}

	/**
	 * toJson method.
	 *
	 * @returns {any}
	 */
	toJson() {
		return {
			'current_page': this.currentPage(),
			'data': this.$items.toArray(),
			'first_page_url': this.url(1),
			'from': this.firstItem(),
			'next_page_url': this.nextPageUrl(),
			'path': this.path(),
			'per_page': this.perPage(),
			'prev_page_url': this.previousPageUrl(),
			'to': this.lastItem(),
		};
	}

	/**
	 * jsonSerialize method.
	 *
	 * @returns {any}
	 */
	jsonSerialize() {
		return this.toJson();
	}
}
module.exports = Paginator
