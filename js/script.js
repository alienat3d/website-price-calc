'use strict';
/* 
[✓] 1) В нашем проекте (в верстке) есть input[type=checkbox] с id=cms-open. При его выборе должен открываться блок с классом hidden-cms-variants.
Внимание, блоку с классом hidden-cms-variants необходимо добавлять свойство display: flex, а не display: block.

[✓] 2) При выборе option с значением "Другое" (value=other) должен открываться блок с классом main-controls__input, но только тот, что внутри блока с классом hidden-cms-variants (ВНИМАНИЕ, блоков с классом main-controls__input в проекте много, искать стоит внутри определенного элемента)

[✓] 3) Если в input[type=checkbox] выбран вариант с числовым value (value=50) то высчитываем общую стоимость работы с учетом данного value. Значение + процент от общей стоимости работы
Пример: общая стоимость работы равна 30.000. При выборе варианта WordPress с value=50 стоимость работы рассчитывается так: 30.000 + 15.000 = 45.000 (15.000 это 50% от 30.000)
		? CMS должен увеличивать на определенный процент Итоговая стоимость, вот. В Стоимости услуг не отображается, это работа, а не услуга. То есть. Если ранее калькулятор рассчитывал Итоговая стоимость как 30.000 то они должны при выборе 50% пересчитаться как 45.000. Так же пересчитывается и стоимость с учетом отката

[✓] 4) При нажатии на кнопку Сброс метод reset() должен возвращать в исходное состояние и блок с классом hidden-cms-variants
*/

const title = document.getElementsByTagName('h1')[0];
const startBtn = document.querySelector('#start');
const resetBtn = document.querySelector('#reset');
const plusBtn = document.querySelector('.screen-btn');
const optionPercentCheckboxes = document.querySelectorAll('.other-items.percent');
const optionNumCheckboxes = document.querySelectorAll('.other-items.number');
const optionCheckboxes = document.querySelectorAll('.main-controls__checkbox .custom-checkbox');
// == [hw] ==
const сmsCheckbox = document.getElementById('cms-open');
const сmsOptionsBlock = document.querySelector('.hidden-cms-variants');
const сmsOptionsSelect = сmsOptionsBlock.querySelector('#cms-select');
const сmsOtherInputBlock = сmsOptionsBlock.querySelector('.main-controls__input');
const сmsOtherInput = сmsOtherInputBlock.querySelector('input');
// == / [hw] ==
const rollbackController = document.querySelector('.rollback input');
const rollbackControllerValue = document.querySelector('.rollback .range-value');
const total = document.getElementsByClassName('total-input')[0];
const totalCount = document.getElementsByClassName('total-input')[1];
const totalCountOther = document.getElementsByClassName('total-input')[2];
const fullTotalCount = document.getElementsByClassName('total-input')[3];
const totalCountRollback = document.getElementsByClassName('total-input')[4];

let screens = document.querySelectorAll('.screen');
let screenSelects = screens[0].querySelectorAll('select');
let screenInputs = screens[0].querySelectorAll('input');

const appData = {
	title: '',
	screens: [],
	screensCount: 0,
	screenPrice: 0,
	adaptive: true,
	servicePricesPercent: 0,
	servicePricesNumber: 0,
	rollback: 0,
	fullPrice: 0,
	servicePercentPrice: 0,
	cmsPercentPrice: 0,
	servicesPercent: {},
	servicesNumber: {},
	init() {
		this.addTitle();
		startBtn.addEventListener('click', () => {
			if (сmsCheckbox.checked) {
				if (this.checkFields(screenSelects, screenInputs) && this.checkCmsOptionsFields(сmsOptionsSelect, сmsOtherInput)) {
					this.showElem(resetBtn, 'block');
					this.hideElem(startBtn);
					this.start();
					this.disableEnableInputs(true);
				}
			} else if (!сmsCheckbox.checked) {
				if (this.checkFields(screenSelects, screenInputs)) {
					this.showElem(resetBtn, 'block');
					this.hideElem(startBtn);
					this.start();
					this.disableEnableInputs(true);
				}
			}
		});
		resetBtn.addEventListener('click', () => {
			this.showElem(startBtn, 'block');
			this.hideElem(resetBtn);
			this.reset();
			this.disableEnableInputs(false);
		});
		plusBtn.addEventListener('click', () => this.addScreenBlock());
		rollbackController.addEventListener('input', () => this.operateRangeInput());
		// == [hw] ==
		сmsCheckbox.addEventListener('change', () =>
			сmsCheckbox.checked ?
				this.showElem(сmsOptionsBlock) :
				this.hideElem(сmsOptionsBlock)
		);
		сmsOptionsSelect.addEventListener('change', () =>
			сmsOptionsSelect.value === 'other' ?
				this.showElem(сmsOtherInputBlock) :
				this.hideElem(сmsOtherInputBlock)
		);
		// == / [hw] ==
	},
	start() {
		this.addScreens();
		this.addServices();
		this.addPrices();
		this.addCmsPrice();
		this.showResult();
		// this.logger();
	},
	reset() {
		this.clearVariables();
		this.clearTagValues();
		this.removeScreenBlocks();
		this.showResult();
	},
	addTitle() {
		document.title = title.textContent;
	},
	isNumber(num) {
		return !isNaN(parseFloat(num)) && isFinite(num);
	},
	disableEnableInputs(value) {
		screenSelects.forEach(select => select.disabled = value);
		screenInputs.forEach(input => input.disabled = value);
		optionCheckboxes.forEach(checkbox => checkbox.disabled = value);
		plusBtn.disabled = value;
		rollbackController.disabled = value;
		сmsOptionsSelect.disabled = value;
		сmsOtherInput.disabled = value;
	},
	checkFields(selects, inputs) {
		let error = false;
		selects.forEach(select => {
			if (select.selectedIndex === 0) error = true;
		});
		inputs.forEach(input => {
			if (input.value === '' || input.value <= 0 || !this.isNumber(input.value)) error = true;
		});
		return !error;
	},
	checkCmsOptionsFields(select, input) {
		let error = false;
		if (select.selectedIndex === 0) error = true;
		if (select.value === 'other' && (input.value === '' || input.value <= 0 || !this.isNumber(input.value))) error = true;
		return !error;
	},
	operateRangeInput() {
		rollbackControllerValue.textContent = rollbackController.value + ' %';
		this.rollback = +rollbackController.value;
		this.servicePercentPrice = this.fullPrice - (this.fullPrice * (this.rollback / 100));
		totalCountRollback.value = this.servicePercentPrice;
	},
	showResult() {
		total.value = this.screenPrice;
		totalCountOther.value = this.servicePricesPercent + this.servicePricesNumber;
		totalCount.value = this.screensCount;
		// == [hw] ==
		if (сmsCheckbox.checked) {
			this.addCmsPrice();
			const totalCmsPrice = this.fullPrice + (this.fullPrice * this.cmsPercentPrice);
			fullTotalCount.value = Math.round(totalCmsPrice);
			totalCountRollback.value = Math.round(totalCmsPrice - (totalCmsPrice * (this.rollback / 100)));
		} else {
			fullTotalCount.value = Math.round(this.fullPrice);
			totalCountRollback.value = Math.round(this.servicePercentPrice);
		}
		// == / [hw] ==
	},
	addScreens() {
		screens = document.querySelectorAll('.screen');
		screens.forEach(function (screen, index) {
			const select = screen.querySelector('select');
			const input = screen.querySelector('input');
			const selectName = select.options[select.selectedIndex].textContent;
			appData.screens.push({
				id: index,
				name: selectName,
				price: select.value * +input.value,
				count: +input.value
			});
		});
	},
	addScreenBlock() {
		const cloneScreen = screens[0].cloneNode(true);
		cloneScreen.querySelector('input').value = '';
		plusBtn.insertAdjacentElement('beforebegin', cloneScreen);
		screens = document.querySelectorAll('.screen');
		screenSelects = document.querySelectorAll('.screen select');
		screenInputs = document.querySelectorAll('.screen input');
	},
	removeScreenBlocks() {
		this.screens = [];
		screens.forEach((screen, index) => {
			if (index > 0) screen.remove();
		});
	},
	addServices() {
		optionPercentCheckboxes.forEach(item => {
			const checkbox = item.querySelector('input[type=checkbox]');
			const label = item.querySelector('label');
			const input = item.querySelector('input[type=text]');
			if (checkbox.checked) this.servicesPercent[label.textContent] = +input.value;
		});

		optionNumCheckboxes.forEach(item => {
			const checkbox = item.querySelector('input[type=checkbox]');
			const label = item.querySelector('label');
			const input = item.querySelector('input[type=text]');
			if (checkbox.checked) this.servicesNumber[label.textContent] = +input.value;
		});
	},
	addPrices() {
		this.screenPrice = this.screens.reduce(function (sum, item) {
			return sum + +item.price;
		}, 0)

		this.screensCount = this.screens.reduce(function (sum, item) {
			return sum + +item.count;
		}, 0)

		for (const key in this.servicesNumber) {
			this.servicePricesNumber += this.servicesNumber[key];
		}

		for (const key in this.servicesPercent) {
			this.servicePricesPercent += this.screenPrice * (this.servicesPercent[key] / 100);
		}

		this.fullPrice = +this.screenPrice + this.servicePricesNumber + this.servicePricesPercent;

		this.servicePercentPrice = this.fullPrice - (this.fullPrice * (this.rollback / 100));
	},
	clearVariables() {
		this.screenPrice = 0;
		this.screensCount = 0;
		this.screenPrice = 0;
		this.servicePricesPercent = 0;
		this.servicePricesNumber = 0;
		this.rollback = 0;
		this.fullPrice = 0;
		this.servicePercentPrice = 0;
		this.cmsPercentPrice = 0;
		this.servicesPercent = {};
		this.servicesNumber = {};
	},
	clearTagValues() {
		rollbackController.value = 0;
		rollbackControllerValue.textContent = '0%';
		screens[0].querySelector('input').value = '';
		screens[0].querySelector('select').selectedIndex = 0;
		optionCheckboxes.forEach(checkbox => checkbox.checked = false);
		this.hideElem(сmsOptionsBlock);
		сmsOptionsSelect.selectedIndex = 0;
		сmsOtherInput.value = '';
	},
	// == [hw] ==
	showElem(elem, prop = 'flex') {
		elem.style.display = prop;
	},
	hideElem(elem) {
		elem.style.display = 'none';
	},
	addCmsPrice() {
		сmsOptionsSelect.value === 'other' ?
			this.cmsPercentPrice = +сmsOtherInput.value / 100 :
			this.cmsPercentPrice = +сmsOptionsSelect.value / 100;
	},
	// == / [hw] ==
	logger() {
		console.log(this.screens);
	}
}

appData.init();