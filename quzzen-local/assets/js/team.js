/* TEAM */
						document.addEventListener('DOMContentLoaded', () => new Swiper('.teams-slider', {
							loop: false,
							slidesPerView: 1,
							spaceBetween: 10,
							autoHeight: true,
							navigation: {
								nextEl: '.teams-slider-container .swiper-btn-next',
								prevEl: '.teams-slider-container .swiper-btn-prev',
							},
							breakpoints: {
								320: {
									slidesPerView: 'auto',
									freeMode: true,
								},
								480: {
									slidesPerView: 2,
									freeMode: false,
								},
								740: {
									slidesPerView: 3,
								}
							},
						}));
					
