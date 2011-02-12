/*
 * basic.js
 * version: 1.0
 *
 * Copyright (c) yutaka sumi(http://www.kuzira.org/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 2010-01-01
 */

//ちらつき回避
try {
	document.execCommand('BackgroundImageCache', false, true);
} catch(e) {}

//ブラウザ判定
var ua = navigator.userAgent;
var win = (ua.indexOf("Windows")!=-1);
var mac = (ua.indexOf("Macintosh")!=-1);
var ie = (ua.indexOf("MSIE")!=-1);
var ie5 = (ua.indexOf("MSIE 5")!=-1);
var ie6 = (ua.indexOf("MSIE 6")!=-1);
var ie7 = (ua.indexOf("MSIE 7")!=-1);
var ie8 = (ua.indexOf("MSIE 8")!=-1);
var moz = (ua.indexOf("Firefox")!=-1);
var webkit = (ua.indexOf("Safari")!=-1);

$(function(){
					 
	if(ie6||ie7){
		
		//IE用マージン制御のクラス付与		   
		var mC = $('div#mainContents');
		var lo = mC.find('div.locator');
		var tx = $('p,ul,ol,li,dl,dt,dd,table,tr,th,td');
		
		tx.filter(':last-child').addClass('lastChild');// lastChild
	
		if(ie6){
			lo.find('h2,h3,h4').filter(':first-child').addClass('firstChild');// ロケータの中に見だしがある場合
			lo.next('h2,h3,h4').addClass('siblingA');// ロケータの次に見出しがある場合
			mC.find('h2 + h3,h3 + h4').addClass('siblingB');// 見出しが連続する場合
			mC.find('h2 + div.locator h3,h3 + div.locator h4').filter(':first-child').addClass('siblingB');// 見出しがロケータをはさんで連続する場合
			mC.find('ul,table').each(function(){
				$(this).find('li:odd,tr:odd').addClass('even');
				$(this).find('li:even,tr:even').addClass('odd');
			});
			tx.filter(':first-child').addClass('firstChild');// firstChild
		}
	}

	//別窓ウインドウ
	$('a[href^="http"]').not('[href*="'+document.domain+'"]').click(function(){
		window.open(this.href, "_blank");
		return false;
	}).each(function() {
		$(this.parentNode).addClass('external');
	});

	//PDF
	$('a[href$=".pdf"]').click(function(){
		window.open(this.href, "_blank");
		return false;	
	}).each(function() {
		$(this.parentNode).addClass('pdf');
	});	

	$('a[href$=".doc"]').each(function(){$(this.parentNode).addClass('word');});	
	$('a[href$=".xls"]').each(function(){$(this.parentNode).addClass('excel');});	
	$('a[href$=".ppt"]').each(function(){$(this.parentNode).addClass('ppt');});	
	$('a[href$=".zip"]').each(function(){$(this.parentNode).addClass('zip');});
	$('a[href$=".exe"]').each(function(){$(this.parentNode).addClass('exe');});
	$('a[href^="mailto"]').each(function(){$(this.parentNode).addClass('mailTo');});	

	//画像へ直リンクするとthickboxで表示(thickbox.js利用)
	tb_init('a[href$=".jpg"], a[href$=".gif"], a[href$=".png"]');

});

// EOF