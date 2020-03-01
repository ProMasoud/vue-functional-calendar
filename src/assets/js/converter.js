import PersianDate from 'persian-date';

export default class Converter {
	type = 'jalali';
	Date = new Date();

	constructor(Date = new Date, type = 'jalali') {
		this.type = type;
		this.Date = Date;

		if (!isNaN(this.Date.getTime())){
			throw "Invalid Date";
		}
	}

	isJalali = () => this.type === 'jalali';

	day = () => {
		if (this.isJalali()) {
			return new PersianDate(this.Date).day();
		}
		return this.Date.getDay()
	};

	date = (date = null) => {
		if (date){
			this.Date.setDate(date);
		}

		if (this.isJalali()) {
			return new PersianDate(this.Date).date();
		}
		return this.Date.getDate()
	};

	year = (year = null) => {
		if (year){
			this.Date.setFullYear(year);
		}

		if (this.isJalali()) {
			return new PersianDate(this.Date).year();
		}
		return this.Date.getFullYear()
	};
}
