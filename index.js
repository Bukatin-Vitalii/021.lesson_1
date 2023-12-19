import { categories } from './store/categories.js';
import { products } from './store/products.js';

const categoriesList = document.querySelector('.categories__list');
const productsList = document.querySelector('.products__list');
const productInfo = document.querySelector('.product__info');
let currentCategory;
let itemToOrder;

const renderList = (list, domEl) => {
	if (domEl.children.length > 0) {
		domEl.innerHTML = '';
	}

	list.forEach((item) => {
		const li = document.createElement('li');
		li.classList.add('shop__item');
		li.dataset.id = item.id;
		li.textContent = item.name;
		li.addEventListener('click', () => {
			if (item.categoriesId) {
				renderItem(item);
				hideBuyForm();
			} else {
				if (currentCategory !== item.id) {
					productInfo.innerHTML = '';
				}
				hideBuyForm();
				currentCategory = item.id;
				renderList(products.filter((product) => product.categoriesId === item.id), productsList);
			}
		});

		domEl.append(li);
	});
}

renderList(categories, categoriesList);

const renderItem = (item) => {
	if (productInfo.children.length > 0) {
		productInfo.innerHTML = '';
	}
	const title = document.createElement('h2');
	title.classList.add('product__title');
	title.textContent = item.name;

	const image = document.createElement('img');
	image.classList.add('product__image');
	image.src = item.imageLink;;

	const price = document.createElement('p');
	price.classList.add('product__price')
	price.textContent = `${item.price} $`;

	const buyBtn = document.createElement('button');
	buyBtn.classList.add('product__buy-btn');
	buyBtn.textContent = 'Make order';
	buyBtn.addEventListener('click', () => {
		showBuyForm();
		itemToOrder = item;
	});

	productInfo.append(title, image, price, buyBtn);
}

function showBuyForm() {
	form.classList.add('form_active');
}

function hideBuyForm() {
	form.classList.remove('form_active');
	itemToOrder = null;
}

const form = document.querySelector('.form');

function fillSelectInput(select, list) {
	list.forEach((item) => {
		const option = document.createElement('option');
		option.value = item;
		option.textContent = item;
		select.append(option);
	});
}

const cityList = ['Odessa', 'Kiev', 'Lviv', 'Kharkiv', 'Dnipro', 'Zaporizhzhia'];
const citySelect = document.querySelector('#city');
fillSelectInput(citySelect, cityList);

const paymentList = ['Cash', 'Card', 'PayPal'];
const paymentSelect = document.querySelector('#payMethod');
fillSelectInput(paymentSelect, paymentList);

const formBtn = document.querySelector('.form__submit');
formBtn.addEventListener('click', async (event) => {
	event.preventDefault();

	const data = {
		userData: {
			fullName: document.querySelector('#fullName').value,
			city: document.querySelector('#city').value,
			postOfficeNumber: document.querySelector('#novaPoshta').value,
			payMethod: document.querySelector('#payMethod').value,
			quantity: document.querySelector('#quantity').value,
			comment: document.querySelector('#comment').value,
		},
		productData: {
			name: itemToOrder.name,
			price: itemToOrder.price,
			totalPrice: itemToOrder.price * document.querySelector('#quantity').value,
			imageLink: itemToOrder.imageLink,
		},
	};

	if (validateForm()) {
		await showLoader();
		hideBuyForm();
		showOrderReceipt(data);
	};
});

function validateForm() {
	const inputs = document.querySelectorAll('.form__input_required');
	let isValid = true;

	inputs.forEach((input) => {
		if (input.value === '') {
			input.classList.add('form__input_error');

			if (!input.nextElementSibling) {
				const error = document.createElement('p');
				error.classList.add('form__error-text');
				error.textContent = 'This field is required';
				input.after(error);
			}

			isValid = false;
		} else {
			input.classList.remove('form__input_error');

			const error = input.nextElementSibling;
			if (error && error.classList.contains('form__error-text')) {
				error.remove();
			}
		}
	});

	return isValid;
}

const loader = document.querySelector('.loader');
function showLoader() {
	return new Promise((resolve) => {
		loader.classList.add('loader_active');
		setTimeout(() => {
			resolve();
			loader.classList.remove('loader_active');
		}, 1500);
	});
}



function showOrderReceipt(data) {
	const blur = document.createElement('div');
	blur.classList.add('blur');
	document.body.append(blur);

	const receiptWrapper = document.createElement('div');
	receiptWrapper.classList.add('receipt');

	const receiptTitle = document.createElement('h2');
	receiptTitle.classList.add('receipt__title');
	receiptTitle.textContent = 'Your order successfully created!';

	const receipt = document.createElement('div');
	receipt.classList.add('receipt__info');

	const userInfo = document.createElement('ul');
	userInfo.classList.add('receipt__list');
	for (let key in data.userData) {
		const li = document.createElement('li');
		li.classList.add('receipt__item');
		li.textContent = `${getItemString(key)}: ${data.userData[key]}`;
		userInfo.append(li);
	}

	const productInfo = document.createElement('ul');
	productInfo.classList.add('receipt__list');
	for (let key in data.productData) {
		const li = document.createElement('li');
		li.classList.add('receipt__item');
		if (key === 'imageLink') {
			const image = document.createElement('img')
			image.classList.add('receipt__item--image')
			image.src = data.productData[key]
			li.append(image)
		} else {
			if (key === 'totalPrice' || key === 'price') {
				li.textContent = `${getItemString(key)}: ${data.productData[key]} $`;
			} else {
				li.textContent = `${getItemString(key)}: ${data.productData[key]}`;
			}
		}
		productInfo.append(li);
	}

	const closeBtn = document.createElement('button');
	closeBtn.classList.add('receipt__close-btn');
	closeBtn.textContent = 'X';
	closeBtn.addEventListener('click', () => {
		blur.remove();
	});

	receipt.append(userInfo, productInfo);
	receiptWrapper.append(receiptTitle, receipt, closeBtn);
	blur.append(receiptWrapper);
}

function getItemString(key) {
	switch (key) {
		case 'fullName':
			return 'Full name';
		case 'city':
			return 'City';
		case 'postOfficeNumber':
			return 'Nova Poshta office number';
		case 'payMethod':
			return 'Payment method';
		case 'quantity':
			return 'Quantity';
		case 'comment':
			return 'Comment';
		case 'name':
			return 'Name';
		case 'price':
			return 'Price';
		case 'totalPrice':
			return 'Total price';
		default:
			return '';
	}
}