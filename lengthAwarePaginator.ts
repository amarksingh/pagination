const AbstractPaginator = require('./abstractPaginator');
const Collection = require('@ostro/support/collection')
const UrlWindow = require('./urlWindow');
const { is_object, rtrim } = require('@ostro/support/function');
class LengthAwarePaginator extends AbstractPaginator {

	/**
	 * $total property.
	 * @type {any}
	 */
	$total;

	/**
	 * $lastPage property.
	 * @type {any}
	 */
	$lastPage;

	/**
	 * constructor method.
	 *
	 * @param {any} items
	 * @param {any} total
	 * @param {any} perPage
	 * @param {any} currentPage
	 * @param {any} options
	 * @param {any} request
	 * @returns {any}
	 */
	constructor($items: any[], $total: number, $perPage: number, $currentPage: any = null, $options: Record<string, any> = {}, $request: Record<string, any> = {}) {
		super();
		this.$options = $options;
		this.$request = $request;

		for (let $key in $options) {
			this[$key] = $options[$key];
		}

		this.$total = $total;
		this.$perPage = parseInt($perPage);
		this.$lastPage = Math.max(parseInt(Math.ceil($total / $perPage)), 1);
		this.$path = this.$path !== '/' ? rtrim(this.$path, '/') : this.$path;
		this.$currentPage = this.setCurrentPage($currentPage, this.$pageName);
		this.$items = $items instanceof Collection ? $items : Collection.make($items);
	}

	/**
	 * setCurrentPage method.
	 *
	 * @param {any} currentPage
	 * @param {any} pageName
	 * @returns {any}
	 */
	setCurrentPage($currentPage: any, $pageName: any) {
		$currentPage = $currentPage || this.resolveCurrentPage($pageName);

		return this.isValidPageNumber($currentPage) ? parseInt($currentPage) : 1;
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
		return this.viewFactory().make($view || this.$defaultView, Object.assign($data, {
			'paginator': this,
			'elements': this.elements(),
		}));
	}

	/**
	 * linkCollection method.
	 *
	 * @returns {any}
	 */
	linkCollection() {
		return new Collection(this.elements()).flatMap(($item) => {
			if (typeof ($item) != 'object') {
				return [{ 'url': null, 'label': '...', 'active': false }];
			}
			let pages = [];
			for (let $page in $item) {
				/**
				 * $page property.
				 * @type {any}
				 */
				$page = parseInt($page);
				pages.push({
					'url': $item[$page],
					'label': String($page),
					'active': this.currentPage() === $page,
				});
			}
			return pages;
		}).prepend({
			'url': this.previousPageUrl(),
			'label': 'Previous',
			'active': false,
		}).push({
			'url': this.nextPageUrl(),
			'label': 'Next',
			'active': false,
		});
	}

	/**
	 * elements method.
	 *
	 * @returns {any}
	 */
	elements() {
		const window = UrlWindow.make(this);

		return [
			window.first,
			window.slider && is_object(window.slider) ? '...' : null,
			window.last,
		].filter(element => element !== null);
	}

	/**
	 * total method.
	 *
	 * @returns {any}
	 */
	total() {
		return this.$total;
	}

	/**
	 * hasMorePages method.
	 *
	 * @returns {any}
	 */
	hasMorePages() {
		return this.currentPage() < this.lastPage();
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
	 * lastPage method.
	 *
	 * @returns {any}
	 */
	lastPage() {
		return this.$lastPage;
	}

	/**
	 * toJSON method.
	 *
	 * @returns {any}
	 */
	toJSON() {
		return this.toJson();
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
			'last_page': this.lastPage(),
			'last_page_url': this.url(this.lastPage()),
			'links': this.linkCollection().toArray(),
			'next_page_url': this.nextPageUrl(),
			'path': this.path(),
			'per_page': this.perPage(),
			'prev_page_url': this.previousPageUrl(),
			'to': this.lastItem(),
			'total': this.total(),
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

module.exports = LengthAwarePaginator
