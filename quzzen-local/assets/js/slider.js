/* SLIDER */
				document.addEventListener('DOMContentLoaded', () =>new Swiper('.promo-slider', {
					loop: true,
					spaceBetween: 24,
					autoHeight: true,
					pagination: {
						el: ".promo-slider-fraction",
						type: "fraction",
						renderFraction: (currentClass, totalClass) => `<span class="${currentClass}"></span>/<span class="${totalClass}"></span>`,
					},
					navigation: {
						nextEl: '.promo-slider .swiper-btn-next',
						prevEl: '.promo-slider .swiper-btn-prev',
					},
				}));
			
