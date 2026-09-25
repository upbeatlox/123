/* SHSLIDER */
	document.addEventListener('DOMContentLoaded', () => {
		const catalogBlockEl = document.querySelector('.catalog-slider');
		if (!catalogBlockEl) return;

		new Swiper(catalogBlockEl, {
			spaceBetween: 8,
			slidesPerView: 'auto',
			mousewheel: {
				forceToAxis: true,
				sensitivity: 1,
			},
			freeMode: {
				enabled: true,
				sticky: false,
				momentumBounce: false,
			},
			grabCursor: true,
			navigation: {
				enabled: true,
				nextEl: '.catalog-slider-container .swiper-btn-next',
				prevEl: '.catalog-slider-container .swiper-btn-prev',
			},
		});
	});
