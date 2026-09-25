/* REVIEWS */
document.addEventListener('DOMContentLoaded', () => new Swiper('.reviews-slider', {
							loop: true,
							slidesPerView: 1,
							spaceBetween: 10,
							roundLengths:true,
							breakpoints: {
								320: {
									autoHeight: true,
								},
								850: {
									slidesPerView: 2,
									pagination: false,
									autoHeight: false,
								}
							},
							pagination: {
								el: ".reviews-slider-container .swiper-pagination",
							},
							navigation: {
								nextEl: '.reviews-slider-container .swiper-btn-next',
								prevEl: '.reviews-slider-container .swiper-btn-prev',
							},
						}));
