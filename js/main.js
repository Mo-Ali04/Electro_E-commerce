(function($) {
	"use strict"

	// Mobile Nav toggle
	$('.menu-toggle > a').on('click', function (e) {
		e.preventDefault();
		$('#responsive-nav').toggleClass('active');
	})

	// Fix cart dropdown from closing
	$('.cart-dropdown').on('click', function (e) {
		e.stopPropagation();
	});

	/////////////////////////////////////////

	// Function to update cart summary
	function updateCartSummary(priceChange, countChange = 1) {
		// Update cart dropdown count
		let dropCount = parseInt($(".cart-summary .item-number").text()) || 0;
		dropCount += countChange;
		$(".cart-summary .item-number").text(dropCount);

		// Update cart count from the outside
		let cartCount = parseInt($(".qty .item-number").text()) || 0;
		cartCount += countChange;
		$(".qty .item-number").text(cartCount);
	
		// Update cart total price
		let cartTotal = parseFloat($(".cart-summary .cart-total").text()) || 0;
		cartTotal += priceChange;
		$(".cart-summary .cart-total").text(cartTotal.toFixed(2));
		$(".order-total-num").text(cartTotal.toFixed(2));


		// Save updated cart to localStorage
		saveCartToLocalStorage();

	}

	// Adding products to cart
	$('.add-to-cart-btn').on('click', function () {

		// Get product information
		let product = $(this).closest(".product");
		let productImg = product.find(".product-img img").attr("src");
		let productName = product.find(".product-name").text();
		let productPrice = parseFloat(product.find(".original-price").text() || 0); // Ensure price exists

		// Check if product is already in the cart
		let existingItem = $(".cart-list .product-widget").filter(function () {
			// Compare the image or other unique identifiers
			return $(this).find("img").attr("src") === productImg;
		});
	
		if ( existingItem.length ) {
			// If the product exists, update the quantity
			let qtyElement = existingItem.find(".qty");
			let currentQty = parseInt(qtyElement.text().replace("x", ""));
			qtyElement.text((currentQty + 1) + "x");
		} else {
			// If the product does not exist, add it to the cart
			let cartItem = `
			<div class="product-widget">
				<div class="product-img">
					<img src="${productImg}" alt="${productName}">
				</div>
				<div class="product-body">
					<h3 class="product-name"><a href="#">${productName}</a></h3>
					<h4 class="product-price"><span class="qty">1x</span>$<span class="original-price">${productPrice.toFixed(2)}</span></h4>
				</div>
				<button class="delete"><i class="fa fa-close"></i></button>
			</div>
			`;
			$(".cart-list").append(cartItem);
		}

		// Update cart summary
		updateCartSummary(productPrice, 1);

		// Reload the cart from localStorage
		loadCartFromLocalStorage();
	});
	
	// Remove products from cart
	$(".cart-list").on("click", ".delete", function() {
		let productWidget = $(this).closest(".cart-list .product-widget");
		let qty = parseInt(productWidget.find(".qty").text().replace("x", "")) || 1;
		let productPrice = parseFloat(productWidget.find(".original-price").text()) || 0;
		
		// Remove the product widget from the cart
		productWidget.remove();

		// Update cart summary
		updateCartSummary(-productPrice * qty, -qty);

		// Reload the cart from localStorage
		loadCartFromLocalStorage();
	});

	// Function to save cart to localStorage
	function saveCartToLocalStorage() {
		let cartData = [];
		
		$(".cart-list .product-widget").each(function () {
			let productImg = $(this).find(".product-img img").attr("src");
			let productName = $(this).find(".product-name a").text();
			let productPrice = parseFloat($(this).find(".original-price").text()) || 0;
			let qty = parseInt($(this).find(".qty").text().replace("x", "")) || 1;

			cartData.push({
				img: productImg,
				name: productName,
				price: productPrice,
				qty: qty
			});
		});

		localStorage.setItem("cart", JSON.stringify(cartData));
	}

	// Function to load cart from localStorage
	function loadCartFromLocalStorage() {
		let cartData = JSON.parse(localStorage.getItem("cart")) || [];
	
		$(".cart-list").empty(); // Clear existing cart list
		$(".order-products").empty(); // Clear existing order list
		$("#product-main-img").empty(); // Clear images from main slider
    	$("#product-imgs").empty(); // Clear images from thumbnails slider

	
		let cartTotal = 0;
		let cartCount = 0;
	
		cartData.forEach(item => {
			let cartItem = `
			<div class="product-widget">
				<div class="product-img">
					<img src="${item.img}" alt="${item.name}">
				</div>
				<div class="product-body">
					<h3 class="product-name"><a href="#">${item.name}</a></h3>
					<h4 class="product-price"><span class="qty">${item.qty}x</span>$<span class="original-price">${item.price.toFixed(2)}</span></h4>
				</div>
				<button class="delete"><i class="fa fa-close"></i></button>
			</div>
			`;
			let orderItem = `
			<div class="order-col">
				<div><span class="qty">${item.qty}x</span> ${item.name}</div>
				<div>$${item.price.toFixed(2)}</div>
			</div>
			`;
			let productImg = `
			<div class="product-preview">
				<img src="${item.img}" alt="${item.name}">
			</div>
			`
			$(".cart-list").append(cartItem);
			$(".order-products").append(orderItem);
			$("#product-main-img").append(productImg);
			$("#product-imgs").append(productImg);

			cartTotal += item.price * item.qty;
			cartCount += item.qty;
		});
	
		$(".cart-summary .item-number").text(cartCount);
		$(".qty .item-number").text(cartCount);
		$(".cart-summary .cart-total").text(cartTotal.toFixed(2));
		$(".order-total-num").text(cartTotal.toFixed(2));

		// Refresh the slick sliders
		if ($('#product-main-img').hasClass('slick-initialized')) {
			$('#product-main-img').slick('unslick');
		}
		if ($('#product-imgs').hasClass('slick-initialized')) {
			$('#product-imgs').slick('unslick');
		}
	
		$('#product-main-img').slick({
			infinite: true,
			speed: 300,
			dots: false,
			arrows: true,
			fade: true,
			asNavFor: '#product-imgs',
		});
	
		$('#product-imgs').slick({
			slidesToShow: 3,
			slidesToScroll: 1,
			arrows: true,
			centerMode: true,
			focusOnSelect: true,
			centerPadding: 0,
			vertical: true,
			asNavFor: '#product-main-img',
			responsive: [
				{
					breakpoint: 991,
					settings: {
						vertical: false,
						arrows: false,
						dots: true,
					},
				},
			],
		});

		// Reinitialize zoom
		$('#product-main-img .product-preview').zoom();
	}
	
	// Load the cart when the page loads
	$(document).ready(function () {
		loadCartFromLocalStorage();
	});

	// Products Slick
	$('.products-slick').each(function() {
		var $this = $(this),
				$nav = $this.attr('data-nav');

		$this.slick({
			slidesToShow: 4,
			slidesToScroll: 1,
			autoplay: true,
			infinite: true,
			speed: 300,
			dots: false,
			arrows: true,
			appendArrows: $nav ? $nav : false,
			responsive: [{
	        breakpoint: 991,
	        settings: {
	          slidesToShow: 2,
	          slidesToScroll: 1,
	        }
	      },
	      {
	        breakpoint: 480,
	        settings: {
	          slidesToShow: 1,
	          slidesToScroll: 1,
	        }
	      },
	    ]
		});
	});

	// Products Widget Slick
	$('.products-widget-slick').each(function() {
		var $this = $(this),
				$nav = $this.attr('data-nav');

		$this.slick({
			infinite: true,
			autoplay: true,
			speed: 300,
			dots: false,
			arrows: true,
			appendArrows: $nav ? $nav : false,
		});
	});

	/////////////////////////////////////////

	// Product Main img Slick
	$('#product-main-img').slick({
    infinite: true,
    speed: 300,
    dots: false,
    arrows: true,
    fade: true,
    asNavFor: '#product-imgs',
  });

	// Product imgs Slick
  $('#product-imgs').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    focusOnSelect: true,
		centerPadding: 0,
		vertical: true,
    asNavFor: '#product-main-img',
		responsive: [{
        breakpoint: 991,
        settings: {
					vertical: false,
					arrows: false,
					dots: true,
        }
      },
    ]
  });

	// Product img zoom
	var zoomMainProduct = document.getElementById('product-main-img');
	if (zoomMainProduct) {
		$('#product-main-img .product-preview').zoom();
	}

	/////////////////////////////////////////

	// Input number
	$('.input-number').each(function() {
		var $this = $(this),
		$input = $this.find('input[type="number"]'),
		up = $this.find('.qty-up'),
		down = $this.find('.qty-down');

		down.on('click', function () {
			var value = parseInt($input.val()) - 1;
			value = value < 1 ? 1 : value;
			$input.val(value);
			$input.change();
			updatePriceSlider($this , value)
		})

		up.on('click', function () {
			var value = parseInt($input.val()) + 1;
			$input.val(value);
			$input.change();
			updatePriceSlider($this , value)
		})
	});

	var priceInputMax = document.getElementById('price-max'),
		priceInputMin = document.getElementById('price-min');

	if ( priceInputMax != null && priceInputMin != null ) {
		
		priceInputMax.addEventListener('change', function(){
			updatePriceSlider($(this).parent() , this.value)
		});
	
		priceInputMin.addEventListener('change', function(){
			updatePriceSlider($(this).parent() , this.value)
		});
	}

	function updatePriceSlider(elem , value) {
		if ( elem.hasClass('price-min') ) {
			console.log('min')
			priceSlider.noUiSlider.set([value, null]);
		} else if ( elem.hasClass('price-max')) {
			console.log('max')
			priceSlider.noUiSlider.set([null, value]);
		}
	}

	// Price Slider
	var priceSlider = document.getElementById('price-slider');
	if (priceSlider) {
		noUiSlider.create(priceSlider, {
			start: [1, 9999],
			connect: true,
			step: 1,
			range: {
				'min': 1,
				'max': 9999
			}
		});

		priceSlider.noUiSlider.on('update', function( values, handle ) {
			var value = values[handle];
			handle ? priceInputMax.value = value : priceInputMin.value = value
		});
	}

})(jQuery);