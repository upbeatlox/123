/* us5.t */
				function uSocialConnect(obj ) {
					var social = obj.id.split('-')[1];
					obj = $(obj);
					if (obj.hasClass('is-connected') ) {
						if (confirm('Вы действительно желаете отключить аккаунт?') ) {
							obj.addClass('wait');
							_uPostForm('', {type:'POST', url:'/index/sub/', data:{a:4, s:social}});
						}
					} else if (!obj.hasClass('wait') ) {
						uSocialLogin(social);
					}
					return false;
				}
				
