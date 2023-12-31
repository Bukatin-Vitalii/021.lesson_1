import { categories } from './store/categories.js';
import { products } from './store/products.js';

const categoriesList = document.querySelector('.categories__list');
const productsList = document.querySelector('.products__list');
const productInfo = document.querySelector('.product__info');
let currentCategory;
let itemToOrder;

const form = document.querySelector('.form');
const cityList = ['Odessa', 'Kiev', 'Lviv', 'Kharkiv', 'Dnipro', 'Zaporizhzhia'];
const paymentList = ['Cash', 'Card', 'PayPal'];
const formBtn = document.querySelector('.form__submit');

const loader = document.querySelector('.loader');

function renderList(list, domEl) {
	if (domEl.children.length > 0) {
		domEl.textContent = '';
	}

	list.forEach((item) => {
		const li = createListItem(item);
		domEl.append(li);
	});
}

function createListItem(item) {
	const li = document.createElement('li');
	li.classList.add('shop__item');
	li.dataset.id = item.id;
	li.textContent = item.name;
	li.addEventListener('click', () => handleListItemClick(item));
	return li;
}

function handleListItemClick(item) {
	if (item.categoriesId) {
		renderItem(item);
		hideBuyForm();
	} else {
		handleCategoryClick(item);
	}
}

function handleCategoryClick(category) {
	if (currentCategory !== category.id) {
		productInfo.textContent = '';
	}
	hideBuyForm();
	currentCategory = category.id;
	renderList(products.filter((product) => product.categoriesId === category.id), productsList);
}

renderList(categories, categoriesList);

const renderItem = (item) => {
	if (productInfo.children.length > 0) {
		productInfo.textContent = '';
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

const showBuyForm = () => {
	form.classList.add('form_active');
};

const hideBuyForm = () => {
	form.classList.remove('form_active');
	itemToOrder = null;
};

function fillSelectInput(select, list) {
	list.forEach((item) => {
		const option = document.createElement('option');
		option.value = item;
		option.textContent = item;
		select.append(option);
	});
}

fillSelectInput(document.querySelector('#city'), cityList);
fillSelectInput(document.querySelector('#payMethod'), paymentList);

formBtn.addEventListener('click', async (event) => {
	event.preventDefault();


	const userData = {
		fullName: document.querySelector('#fullName').value,
		city: document.querySelector('#city').value,
		postOfficeNumber: document.querySelector('#novaPoshta').value,
		payMethod: document.querySelector('#payMethod').value,
		quantity: document.querySelector('#quantity').value,
		comment: document.querySelector('#comment').value,
	};
	const productData = {
		name: itemToOrder.name,
		price: itemToOrder.price,
		totalPrice: itemToOrder.price * document.querySelector('#quantity').value,
		imageLink: itemToOrder.imageLink,
	};

	const data = { userData, productData };

	if (validateForm()) {
		await showLoader();
		hideBuyForm();
		showOrderReceipt(data);

		const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
		existingOrders.push(data);
		localStorage.setItem('orders', JSON.stringify(existingOrders));
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

const showLoader = () => {
	return new Promise((resolve) => {
		loader.classList.add('loader_active');
		setTimeout(() => {
			resolve();
			loader.classList.remove('loader_active');
		}, 1500);
	});
};

function showOrderReceipt(data) {
	const { userData, productData } = data;

	const blur = document.createElement('div');
	blur.classList.add('blur');
	document.body.append(blur);

	const receiptWrapper = document.createElement('div');
	receiptWrapper.classList.add('receipt');

	const receiptTitle = document.createElement('h2');
	receiptTitle.classList.add('receipt__title');
	receiptTitle.textContent = 'Your order successfully created! :))';

	const receipt = document.createElement('div');
	receipt.classList.add('receipt__info');

	const userInfo = createInfoList(userData);
	userInfo.classList.add('receipt__list');

	const productInfo = createInfoList(productData);
	productInfo.classList.add('receipt__list');

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

function createInfoList(data) {
	const infoList = document.createElement('ul');
	infoList.classList.add('receipt__list');

	for (let key in data) {
		const li = document.createElement('li');
		li.classList.add('receipt__item');

		if (key === 'imageLink') {
			const image = document.createElement('img')
			image.classList.add('receipt__item--image')
			image.src = data[key]
			li.append(image);
		} else {
			if (key === 'totalPrice' || key === 'price') {
				li.textContent = `${getItemString(key)}: ${data[key]} $`;
			} else {
				li.textContent = `${getItemString(key)}: ${data[key]}`;
			}
		}

		infoList.append(li);
	}
	return infoList;
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

const myOrdersBtn = document.querySelector('.btn-to-orders');
const shopBtn = document.querySelector('.btn-to-shop');
const shop = document.querySelector('.shop');
const myOrders = document.querySelector('.my-orders');

shopBtn.addEventListener('click', () => {
	hideMyOrders();
});

myOrdersBtn.addEventListener('click', () => {
	showMyOrders();
});

function showMyOrders() {
	shop.classList.add('shop_hidden');
	myOrders.classList.add('my-orders_active');
	renderExistingOrders();
}

function hideMyOrders() {
	shop.classList.remove('shop_hidden');
	myOrders.classList.remove('my-orders_active');
}

function renderExistingOrders() {
	const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
	const ordersList = document.querySelector('.my-orders__list');

	if (ordersList.children.length > 0) {
		ordersList.textContent = '';
	}

	existingOrders.forEach((order) => {
		const orderItem = document.createElement('li');
		orderItem.classList.add('my-orders__item', 'item');

		const orderInfo = document.createElement('ul');
		orderInfo.classList.add('item__info', 'info');

		const userInfo = document.createElement('ul');
		userInfo.classList.add('info__list');
		for (let key in order.userData) {
			const li = document.createElement('li');
			li.classList.add('info__item');
			li.textContent = `${getItemString(key)}: ${order.userData[key]}`;
			userInfo.append(li);
		}

		const productInfo = document.createElement('ul');
		productInfo.classList.add('info__list');
		for (let key in order.productData) {
			const li = document.createElement('li');
			li.classList.add('info__item');
			if (key === 'imageLink') {
				const image = document.createElement('img')
				image.classList.add('info__item--image')
				image.src = order.productData[key]
				li.append(image)
			} else {
				if (key === 'totalPrice' || key === 'price') {
					li.textContent = `${getItemString(key)}: ${order.productData[key]} $`;
				} else {
					li.textContent = `${getItemString(key)}: ${order.productData[key]}`;
				}
			}
			productInfo.append(li);
		}

		orderInfo.append(userInfo, productInfo);
		orderItem.append(orderInfo);
		ordersList.append(orderItem);
	});
}