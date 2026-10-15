
class UrlWindow {

	/**
	 * $paginator property.
	 * @type {any}
	 */
	$paginator;

	/**
	 * constructor method.
	 *
	 * @param {any} paginator
	 * @returns {any}
	 */
	constructor($paginator) {
		this.$paginator = $paginator;
	}

	/**
	 * make method.
	 *
	 * @static
	 * @param {any} paginator
	 * @returns {any}
	 */
	static make($paginator) {
		return (new this($paginator)).get();
	}

	/**
	 * get method.
	 *
	 * @returns {any}
	 */
	get() {
		const $onEachSide = this.$paginator.$onEachSide;

		if (this.$paginator.lastPage() < ($onEachSide * 2) + 8) {
			return this.getSmallSlider();
		}

		return this.getUrlSlider($onEachSide);
	}

	/**
	 * getSmallSlider method.
	 *
	 * @returns {any}
	 */
	getSmallSlider() {
		return {
			'first': this.$paginator.getUrlRange(1, this.lastPage()),
			'slider': null,
			'last': null,
		};
	}

	/**
	 * getUrlSlider method.
	 *
	 * @param {any} onEachSide
	 * @returns {any}
	 */
	getUrlSlider($onEachSide) {
		const $window = $onEachSide + 4;

		if (!this.hasPages()) {
			return { 'first': null, 'slider': null, 'last': null };
		}


		if (this.currentPage() <= $window) {
			return this.getSliderTooCloseToBeginning($window, $onEachSide);
		}

		else if (this.currentPage() > (this.lastPage() - $window)) {
			return this.getSliderTooCloseToEnding($window, $onEachSide);
		}

		return this.getFullSlider($onEachSide);
	}

	/**
	 * getSliderTooCloseToBeginning method.
	 *
	 * @param {any} window
	 * @param {any} onEachSide
	 * @returns {any}
	 */
	getSliderTooCloseToBeginning($window, $onEachSide) {
		return {
			'first': this.$paginator.getUrlRange(1, $window + $onEachSide),
			'slider': null,
			'last': this.getFinish(),
		};
	}

	/**
	 * getSliderTooCloseToEnding method.
	 *
	 * @param {any} window
	 * @param {any} onEachSide
	 * @returns {any}
	 */
	getSliderTooCloseToEnding($window, $onEachSide) {
		const $last = this.$paginator.getUrlRange(
			this.lastPage() - ($window + ($onEachSide - 1)),
			this.lastPage()
		);

		return {
			'first': this.getStart(),
			'slider': null,
			'last': $last,
		};
	}

	/**
	 * getFullSlider method.
	 *
	 * @param {any} onEachSide
	 * @returns {any}
	 */
	getFullSlider($onEachSide) {
		return {
			'first': this.getStart(),
			'slider': this.getAdjacentUrlRange($onEachSide),
			'last': this.getFinish(),
		};
	}

	/**
	 * getAdjacentUrlRange method.
	 *
	 * @param {any} onEachSide
	 * @returns {any}
	 */
	getAdjacentUrlRange($onEachSide) {
		return this.$paginator.getUrlRange(
			this.currentPage() - $onEachSide,
			this.currentPage() + $onEachSide
		);
	}

	/**
	 * getStart method.
	 *
	 * @returns {any}
	 */
	getStart() {
		return this.$paginator.getUrlRange(1, 2);
	}


	/**
	 * getFinish method.
	 *
	 * @returns {any}
	 */
	getFinish() {
		return this.$paginator.getUrlRange(
			this.lastPage() - 1,
			this.lastPage()
		);
	}

	/**
	 * hasPages method.
	 *
	 * @returns {any}
	 */
	hasPages() {
		return this.$paginator.lastPage() > 1;
	}

	/**
	 * currentPage method.
	 *
	 * @returns {any}
	 */
	currentPage() {
		return this.$paginator.currentPage();
	}

	/**
	 * lastPage method.
	 *
	 * @returns {any}
	 */
	lastPage() {
		return this.$paginator.lastPage();
	}
}
module.exports = UrlWindow;