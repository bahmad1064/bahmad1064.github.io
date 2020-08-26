// Turn off Ajax for local file browsing
if ( location.protocol.substr(0,4)  === "file" ||
     location.protocol.substr(0,11) === "*-extension" ||
     location.protocol.substr(0,6)  === "widget" ) {

	// Start with links with only the trailing slash and that aren't external links
	var fixLinks = function() {
		$( "a[href$='/'], a[href='.'], a[href='..']" ).not( "[rel='external']" ).each( function() {
			if( !$( this ).attr( "href" ).match("http") ){
				this.href = $( this ).attr( "href" ).replace( /\/$/, "" ) + "/index.html";
			}
		});
	};

	// Fix the links for the initial page
	$( fixLinks );

	// Fix the links for subsequent ajax page loads
	$( document ).on( "pagecreate", fixLinks );

	// Check to see if ajax can be used. This does a quick ajax request and blocks the page until its done
	$.ajax({
		url: ".",
		async: false,
		isLocal: true
	}).error(function() {
		// Ajax doesn't work so turn it off
		$( document ).on( "mobileinit", function() {
			$.mobile.ajaxEnabled = false;

			var message = $( "<div>" , {
				"class": "jqm-content",
				style: "border:none; padding: 10px 15px; overflow: auto;",
				"data-ajax-warning": true
			});

			message
			.append( "<h3>Note: Navigation may not work if viewed locally</h3>" )
			.append( "<p>The Ajax-based navigation used throughout the jQuery Mobile docs may need to be viewed on a web server to work in certain browsers. If you see an error message when you click a link, please try a different browser.</p>" );

			$( document ).on( "pagecreate", function( event ) {
				//$( event.target ).append( message );
			});
		});
	});
}

$( document ).on( "pagecreate", ".jqm-demos", function( event ) {
	var search,
		page = $( this ),
		searchUrl = ( $( this ).hasClass( "jqm-home" ) ) ? "_search/" : "../_search/",
		searchContents = $( ".jqm-search-panel ul.jqm-search-list" ).find( "li[data-filtertext]" ),
		version = $.mobile.version || "Dev",
		words = version.split( "-" ),
		ver = words[0],
		str = words[1] || "",
		text = ver,
		versionNumbers = ver.split( "." ),
		apiVersion = versionNumbers[ 0 ] + "." + versionNumbers[ 1 ],
		href;

	// Insert jqm version in header
	if ( str.indexOf( "rc" ) === -1 ) {
		str = str.charAt( 0 ).toUpperCase() + str.slice( 1 );
	} else {
		str = str.toUpperCase().replace( ".", "" );
	}

	if ( $.mobile.version && str ) {
		text += " " + str;
	}

	if ( "@VERSION" === $.mobile.version ) {
		text = version = "Dev";
	}

	$( ".jqm-version" ).html( text );

	// Insert version in API documentation links
	if ( version !== "Dev" ) {
		$( ".jqm-api-docs-link" ).each(function() {
			href = $( this ).attr( "href" ).replace( "api.jquerymobile.com/", "api.jquerymobile.com/" + apiVersion + "/" );

			$( this ).attr( "href", href );
		});
	}

	// Global navmenu panel
	$( ".jqm-navmenu-panel ul" ).listview();

	$( ".jqm-navmenu-panel ul" ).accordion({
		"header": "> li > h3",
		"collapsible": true,
		"active": false,
		"heightStyle": "content",
		"icons": {
			"header": "ui-icon-plus",
			"activeHeader": "ui-icon-minus"
		}
	});

	// Collapse nested accordions when their parent is being collapsed.
	$( ".jqm-navmenu-panel > .ui-panel-inner > .ui-accordion" )
	.on( "accordionbeforeactivate", function( event ) {
		var target = $( event.target );

		if ( target.is( ".jqm-navmenu-panel > .ui-panel-inner > .ui-accordion" ) ) {
			target.find( ".ui-accordion" ).accordion( "option", "active", false );
		}
	});

	// Keyboard accessibility of the navmenu.
	$( ".jqm-navmenu-panel .ui-accordion-header, .jqm-navmenu-panel .ui-listview-item-button" ).on( "keydown", function( event ) {
	    if ( event.which === 9 ) {
	        var target = $( event.target ),
				parent = target.parent( "li" );

			parent.next( "li" )
				.add( parent.prev( "li" ) )
				.children( "h3" )
				.attr( "tabIndex", 0 );
	    }
	});

	// On panel demo pages copy the navmenu into the wrapper
	if ( $( this ).is( ".jqm-panel-page" ) ) {
		var wrapper = $( this ).children( ".ui-panel-wrapper" );

		if ( wrapper ) {
			$( ".jqm-navmenu-panel" ).clone( true, true ).appendTo( wrapper );
		}
	}

	$( ".jqm-navmenu-link" ).on( "click", function() {
		page.find( ".jqm-navmenu-panel" ).panel( "open" );
	});

	// Turn off autocomplete / correct for demos search
	$( this ).find( ".jqm-search input" ).attr( "autocomplete", "off" ).attr( "autocorrect", "off" );

	// Global search

	// Initalize search panel
	$( ".jqm-search-panel" ).panel({
		position: "right",
		display: "overlay",
		theme: "a"
	});

	$( ".jqm-search-link" ).on( "click", function() {
		$( "body" ).find( ".jqm-search-panel" ).panel( "open" );
		$( ".ui-page-active" ).addClass( "jqm-demos-search-panel-open" );
	});

	$( document ).on( "panelopen", ".jqm-search-panel", function() {
		$( this ).find( ".jqm-search-input" ).focus();
	});

	// Initalize search panel list and filter
	$( ".jqm-search-panel ul.jqm-search-list" ).html( searchContents ).listview({
		inset: false,
		theme: null,
		dividerTheme: null,
		icon: false,
		autodividers: true,
		autodividersSelector: function () {
			return "";
		},
		arrowKeyNav: true,
		enterToNav: true,
		highlight: true,
		submitTo: searchUrl
	}).filterable();

	// Initalize search page list
	$( this ).find( ".jqm-search-results-wrap ul.jqm-search-list" ).html( searchContents ).listview({
		inset: false,
		theme: null,
		dividerTheme: null,
		icon: false,
		arrowKeyNav: true,
		enterToNav: true,
		highlight: true
	}).filterable();

	// Search results page get search query string and enter it into filter then trigger keyup to filter
	if ( $( event.target ).hasClass( "jqm-demos-search-results" ) ) {
		search = $.mobile.path.parseUrl( window.location.href ).search.split( "=" )[ 1 ];
		setTimeout(function() {
			var e = $.Event( "keyup" );
			e.which = 65;
			$( this ).find( "#jqm-search-results-input" ).val( search ).trigger(e).trigger( "change" );
		}, 0 );
	}

	// Fix links on homepage to point to sub directories
	if ( $( event.target ).hasClass( "jqm-home") ) {
		$( "body" ).find( "a" ).each( function() {
			$( this ).attr( "href", $( this ).attr( "href" ).replace( "../", "" ) );
		});
	}
});

// Append keywords list to each list item
$( document ).one( "pagecreate", ".jqm-demos", function() {
	$( ".jqm-search-results-list li, .jqm-search li" ).each(function() {
		var text = $( this ).attr( "data-filtertext" );

		$( this )
			.find( "a" )
			.append( "<span class='jqm-search-results-keywords ui-listview-item-description'>" +
				text + "</span>" );
	});
});

// Functions for highlighting text used for keywords highlight in search
jQuery.fn.highlight = function( pat ) {
	function innerHighlight( node, pat ) {
		var skip = 0;
		if ( node.nodeType === 3 ) {
			var pos = node.data.toUpperCase().indexOf( pat );
			if ( pos >= 0 ) {
				var spannode = document.createElement( "span" );
				spannode.className = "jqm-search-results-highlight";
				var middlebit = node.splitText( pos );
				var middleclone = middlebit.cloneNode( true );
				spannode.appendChild( middleclone );
				middlebit.parentNode.replaceChild( spannode, middlebit );
				skip = 1;
			}
		} else if ( node.nodeType === 1 && node.childNodes && !/(script|style)/i.test( node.tagName ) ) {
			for ( var i = 0; i < node.childNodes.length; ++i ) {
				i += innerHighlight( node.childNodes[i], pat );
			}
		}
		return skip;
	}
	return this.length && pat && pat.length ? this.each(function() {
		innerHighlight( this, pat.toUpperCase() );
	}) : this;
};

// Function to remove highlights in text
jQuery.fn.removeHighlight = function() {
	return this.find( "span.jqm-search-results-highlight" ).each(function() {
		this.parentNode.firstChild.nodeName;
		this.parentNode.replaceChild( this.firstChild, this );
		this.parentNode.normalize();
	}).end();
};

// Extension to listview to add keyboard navigation
$( document ).on( "mobileinit", function() {
	(function( $, undefined ) {

	$.widget( "mobile.listview", $.mobile.listview, {
		options: {
			arrowKeyNav: false,
			enterToNav: false,
			highlight: false,
			submitTo: false
		},
		_create: function() {
			this._super();

			if ( this.options.arrowKeyNav ) {
				this._on( document, { "pageshow": "arrowKeyNav" });
			}

			if ( this.options.enterToNav ) {
				this._on( document, { "pageshow": "enterToNav" });
			}

		},
		submitTo: function() {
			var url,
				form = this.element.parent().find( "form" );

			form.attr( "method", "get" )
				.attr( "action", this.options.submitTo );

			url = this.options.submitTo + "?search=" + this.element.parent().find( "input" ).val();

			window.location =  url;
		},
		enterToNav: function() {
			var form = this.element.parent().find( "form" );

			form.append( "<button type='submit' data-icon='caret-r' data-inline='true' class='ui-hidden-accessible' data-iconpos='notext'>Submit</button>" )
				.parent()
				.enhanceWithin();

			this.element.parent().find( "form" ).children( ".ui-button" ).addClass( "ui-hidden-accessible" );

			this._on( form, {
				"submit": "submitHandler"
			});
		},
		enhanced: false,
		arrowKeyNav: function() {
			var input = this.element.prev("form").find( "input" );

			if ( !this.enhanced ) {
				this._on( input, {
					"keyup": "handleKeyUp"
				});

				this.enhanced = true;
			}
		},
		handleKeyUp: function( e ) {
			var search,
				toBeHighlightled,
				input = this.element.prev("form").find( "input" ),
				isDownKeyUp = e.which === $.ui.keyCode.DOWN,
				isUpKeyUp = e.which === $.ui.keyCode.UP;

			if ( isDownKeyUp || isUpKeyUp ) {
				if ( this.element.find( "li.ui-listview-item-active" ).length === 0 ) {
					toBeHighlightled = this.element.find( "li" )
					.not( ".ui-screen-hidden" )
					[ isDownKeyUp ? "first" : "last" ]();
				} else {
					this.element.find( "li.ui-listview-item-active a" )
					.toggleClass( "ui-button-active");

					toBeHighlightled = this.element.find( "li.ui-listview-item-active" )
					.toggleClass( "ui-listview-item-active" )
					[ isDownKeyUp ? "nextAll" : "prevAll" ]( "li" )
					.not( ".ui-screen-hidden" )
					.first();
				}

				// Highlight the selected list item
				toBeHighlightled
				.toggleClass( "ui-listview-item-active" )
				.find( "a" )
				.toggleClass( "ui-button-active" );
			} else if ( e.which === $.ui.keyCode.ENTER ) {
				this.submitHandler();
			} else if ( typeof e.which !== "undefined" ) {
				this.element.find( "li.ui-listview-item-active" )
				.removeClass( "ui-listview-item-active" );

				if ( this.options.highlight ) {
					search = input.val();

					this.element.find( "li" ).each(function() {
						$( this ).removeHighlight();
						$( this ).highlight( search );
					});
				}
			}
		},
		submitHandler: function() {
			if ( this.element.find( "li.ui-listview-item-active" ).length !== 0 ) {
				var href = this.element.find( "li.ui-listview-item-active a" ).attr( "href" );

				$( ":mobile-pagecontainer" ).pagecontainer( "change", href );
				return false;
			}

			if ( this.options.submitTo ) {
				this.submitTo();
			}
		}
	});
})( jQuery );

});


!function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function i(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var a=n(1);Object.keys(a).forEach(function(e){"default"!==e&&Object.defineProperty(t,e,{enumerable:!0,get:function(){return a[e]}})});var o=n(26),s=i(o),l=i(a),u=n(27),c=r(u);n(28),(0,s["default"])(function(){return l["default"].highlight(c.object(window.syntaxhighlighterConfig||{}))})},function(e,t,n){"use strict";function r(e){window.alert("SyntaxHighlighter\n\n"+e)}function i(e,t){var n=h.vars.discoveredBrushes,i=null;if(null==n){n={};for(var a in h.brushes){var o=h.brushes[a],s=o.aliases;if(null!=s){o.className=o.className||o.aliases[0],o.brushName=o.className||a.toLowerCase();for(var l=0,u=s.length;u>l;l++)n[s[l]]=a}}h.vars.discoveredBrushes=n}return i=h.brushes[n[e]],null==i&&t&&r(h.config.strings.noBrush+e),i}function a(e){var t="<![CDATA[",n="]]>",r=u.trim(e),i=!1,a=t.length,o=n.length;0==r.indexOf(t)&&(r=r.substring(a),i=!0);var s=r.length;return r.indexOf(n)==s-o&&(r=r.substring(0,s-o),i=!0),i?r:e}Object.defineProperty(t,"__esModule",{value:!0});var o=n(2),s=n(5),l=n(9)["default"],u=n(10),c=n(11),f=n(17),g=n(18),p=n(19),d=n(20),h={Match:s.Match,Highlighter:n(22),config:n(18),regexLib:n(3).commonRegExp,vars:{discoveredBrushes:null,highlighters:{}},brushes:{},findElements:function(e,t){var n=t?[t]:u.toArray(document.getElementsByTagName(h.config.tagName)),r=(h.config,[]);if(n=n.concat(f.getSyntaxHighlighterScriptTags()),0===n.length)return r;for(var i=0,a=n.length;a>i;i++){var s={target:n[i],params:o.defaults(o.parse(n[i].className),e)};null!=s.params.brush&&r.push(s)}return r},highlight:function(e,t){var n,r=h.findElements(e,t),u="innerHTML",m=null,x=h.config;if(0!==r.length)for(var v=0,b=r.length;b>v;v++){var m,y,w,t=r[v],E=t.target,S=t.params,k=S.brush;null!=k&&(m=i(k),m&&(S=o.defaults(S||{},p),S=o.defaults(S,g),1==S["html-script"]||1==p["html-script"]?(m=new d(i("xml"),m),k="htmlscript"):m=new m,w=E[u],x.useScriptTags&&(w=a(w)),""!=(E.title||"")&&(S.title=E.title),S.brush=k,w=c(w,S),y=s.applyRegexList(w,m.regexList,S),n=new l(w,y,S),t=f.create("div"),t.innerHTML=n.getHtml(),S.quickCode&&f.attachEvent(f.findElement(t,".code"),"dblclick",f.quickCodeHandler),""!=(E.id||"")&&(t.id=E.id),E.parentNode.replaceChild(t,E)))}}},m=0;t["default"]=h;var x=t.registerBrush=function(e){return h.brushes["brush"+m++]=e["default"]||e};t.clearRegisteredBrushes=function(){h.brushes={},m=0};x(n(23)),x(n(24)),x(n(25))},function(e,t,n){"use strict";function r(e){return e.replace(/-(\w+)/g,function(e,t){return t.charAt(0).toUpperCase()+t.substr(1)})}function i(e){var t=o[e];return null==t?e:t}var a=n(3).XRegExp,o={"true":!0,"false":!1};e.exports={defaults:function(e,t){for(var n in t||{})e.hasOwnProperty(n)||(e[n]=e[r(n)]=t[n]);return e},parse:function(e){for(var t,n={},o=a("^\\[(?<values>(.*?))\\]$"),s=0,l=a("(?<name>[\\w-]+)\\s*:\\s*(?<value>[\\w%#-]+|\\[.*?\\]|\".*?\"|'.*?')\\s*;?","g");null!=(t=a.exec(e,l,s));){var u=t.value.replace(/^['"]|['"]$/g,"");if(null!=u&&o.test(u)){var c=a.exec(u,o);u=c.values.length>0?c.values.split(/\s*,\s*/):[]}u=i(u),n[t.name]=n[r(t.name)]=u,s=t.index+t[0].length}return n}}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),t.commonRegExp=t.XRegExp=void 0;var i=n(4),a=r(i);t.XRegExp=a["default"];t.commonRegExp={multiLineCComments:(0,a["default"])("/\\*.*?\\*/","gs"),singleLineCComments:/\/\/.*$/gm,singleLinePerlComments:/#.*$/gm,doubleQuotedString:/"([^\\"\n]|\\.)*"/g,singleQuotedString:/'([^\\'\n]|\\.)*'/g,multiLineDoubleQuotedString:(0,a["default"])('"([^\\\\"]|\\\\.)*"',"gs"),multiLineSingleQuotedString:(0,a["default"])("'([^\\\\']|\\\\.)*'","gs"),xmlComments:(0,a["default"])("(&lt;|<)!--.*?--(&gt;|>)","gs"),url:/\w+:\/\/[\w-.\/?%&=:@;#]*/g,phpScriptTags:{left:/(&lt;|<)\?(?:=|php)?/g,right:/\?(&gt;|>)/g,eof:!0},aspScriptTags:{left:/(&lt;|<)%=?/g,right:/%(&gt;|>)/g},scriptScriptTags:{left:/(&lt;|<)\s*script.*?(&gt;|>)/gi,right:/(&lt;|<)\/\s*script\s*(&gt;|>)/gi}}},function(e,t){"use strict";function n(e,t,n,r,i){var a;if(e[w]={captureNames:t},i)return e;if(e.__proto__)e.__proto__=y.prototype;else for(a in y.prototype)e[a]=y.prototype[a];return e[w].source=n,e[w].flags=r?r.split("").sort().join(""):r,e}function r(e){return S.replace.call(e,/([\s\S])(?=[\s\S]*\1)/g,"")}function i(e,t){if(!y.isRegExp(e))throw new TypeError("Type RegExp expected");var i=e[w]||{},a=o(e),l="",u="",c=null,f=null;return t=t||{},t.removeG&&(u+="g"),t.removeY&&(u+="y"),u&&(a=S.replace.call(a,new RegExp("["+u+"]+","g"),"")),t.addG&&(l+="g"),t.addY&&(l+="y"),l&&(a=r(a+l)),t.isInternalOnly||(void 0!==i.source&&(c=i.source),null!=i.flags&&(f=l?r(i.flags+l):i.flags)),e=n(new RegExp(e.source,a),s(e)?i.captureNames.slice(0):null,c,f,t.isInternalOnly)}function a(e){return parseInt(e,16)}function o(e){return M?e.flags:S.exec.call(/\/([a-z]*)$/i,RegExp.prototype.toString.call(e))[1]}function s(e){return!(!e[w]||!e[w].captureNames)}function l(e){return parseInt(e,10).toString(16)}function u(e,t){var n,r=e.length;for(n=0;r>n;++n)if(e[n]===t)return n;return-1}function c(e,t){return H.call(e)==="[object "+t+"]"}function f(e,t,n){return S.test.call(n.indexOf("x")>-1?/^(?:\s+|#.*|\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/:/^(?:\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/,e.slice(t))}function g(e){for(;e.length<4;)e="0"+e;return e}function p(e,t){var n;if(r(t)!==t)throw new SyntaxError("Invalid duplicate regex flag "+t);for(e=S.replace.call(e,/^\(\?([\w$]+)\)/,function(e,n){if(S.test.call(/[gy]/,n))throw new SyntaxError("Cannot use flag g or y in mode modifier "+e);return t=r(t+n),""}),n=0;n<t.length;++n)if(!z[t.charAt(n)])throw new SyntaxError("Unknown regex flag "+t.charAt(n));return{pattern:e,flags:t}}function d(e){var t={};return c(e,"String")?(y.forEach(e,/[^\s,]+/,function(e){t[e]=!0}),t):e}function h(e){if(!/^[\w$]$/.test(e))throw new Error("Flag must be a single character A-Za-z0-9_$");z[e]=!0}function m(e,t,n,r,i){for(var a,o,s=L.length,l=e.charAt(n),u=null;s--;)if(o=L[s],!(o.leadChar&&o.leadChar!==l||o.scope!==r&&"all"!==o.scope||o.flag&&-1===t.indexOf(o.flag))&&(a=y.exec(e,o.regex,n,"sticky"))){u={matchLength:a[0].length,output:o.handler.call(i,a,r,t),reparse:o.reparse};break}return u}function x(e){E.astral=e}function v(e){RegExp.prototype.exec=(e?k:S).exec,RegExp.prototype.test=(e?k:S).test,String.prototype.match=(e?k:S).match,String.prototype.replace=(e?k:S).replace,String.prototype.split=(e?k:S).split,E.natives=e}function b(e){if(null==e)throw new TypeError("Cannot convert null or undefined to object");return e}function y(e,t){var r,a,o,s,l,u={hasNamedCapture:!1,captureNames:[]},c=R,f="",g=0;if(y.isRegExp(e)){if(void 0!==t)throw new TypeError("Cannot supply flags when copying a RegExp");return i(e)}if(e=void 0===e?"":String(e),t=void 0===t?"":String(t),y.isInstalled("astral")&&-1===t.indexOf("A")&&(t+="A"),N[e]||(N[e]={}),!N[e][t]){for(r=p(e,t),s=r.pattern,l=r.flags;g<s.length;){do r=m(s,l,g,c,u),r&&r.reparse&&(s=s.slice(0,g)+r.output+s.slice(g+r.matchLength));while(r&&r.reparse);r?(f+=r.output,g+=r.matchLength||1):(a=y.exec(s,O[c],g,"sticky")[0],f+=a,g+=a.length,"["===a&&c===R?c=T:"]"===a&&c===T&&(c=R))}N[e][t]={pattern:S.replace.call(f,/\(\?:\)(?:[*+?]|\{\d+(?:,\d*)?})?\??(?=\(\?:\))|^\(\?:\)(?:[*+?]|\{\d+(?:,\d*)?})?\??|\(\?:\)(?:[*+?]|\{\d+(?:,\d*)?})?\??$/g,""),flags:S.replace.call(l,/[^gimuy]+/g,""),captures:u.hasNamedCapture?u.captureNames:null}}return o=N[e][t],n(new RegExp(o.pattern,o.flags),o.captures,e,t)}var w="xregexp",E={astral:!1,natives:!1},S={exec:RegExp.prototype.exec,test:RegExp.prototype.test,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split},k={},C={},N={},L=[],R="default",T="class",O={"default":/\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,"class":/\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u(?:[\dA-Fa-f]{4}|{[\dA-Fa-f]+})|c[A-Za-z]|[\s\S])|[\s\S]/},_=/\$(?:{([\w$]+)}|(\d\d?|[\s\S]))/g,j=void 0===S.exec.call(/()??/,"")[1],A=function(){var e=!0;try{new RegExp("","u")}catch(t){e=!1}return e}(),I=function(){var e=!0;try{new RegExp("","y")}catch(t){e=!1}return e}(),M=void 0!==/a/.flags,z={g:!0,i:!0,m:!0,u:A,y:I},H={}.toString;y.prototype=new RegExp,y.version="3.1.0-dev",y.addToken=function(e,t,n){n=n||{};var r,a=n.optionalFlags;if(n.flag&&h(n.flag),a)for(a=S.split.call(a,""),r=0;r<a.length;++r)h(a[r]);L.push({regex:i(e,{addG:!0,addY:I,isInternalOnly:!0}),handler:t,scope:n.scope||R,flag:n.flag,reparse:n.reparse,leadChar:n.leadChar}),y.cache.flush("patterns")},y.cache=function(e,t){return C[e]||(C[e]={}),C[e][t]||(C[e][t]=y(e,t))},y.cache.flush=function(e){"patterns"===e?N={}:C={}},y.escape=function(e){return S.replace.call(b(e),/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")},y.exec=function(e,t,n,r){var a,o,s="g",l=!1;return l=I&&!!(r||t.sticky&&r!==!1),l&&(s+="y"),t[w]=t[w]||{},o=t[w][s]||(t[w][s]=i(t,{addG:!0,addY:l,removeY:r===!1,isInternalOnly:!0})),o.lastIndex=n=n||0,a=k.exec.call(o,e),r&&a&&a.index!==n&&(a=null),t.global&&(t.lastIndex=a?o.lastIndex:0),a},y.forEach=function(e,t,n){for(var r,i=0,a=-1;r=y.exec(e,t,i);)n(r,++a,e,t),i=r.index+(r[0].length||1)},y.globalize=function(e){return i(e,{addG:!0})},y.install=function(e){e=d(e),!E.astral&&e.astral&&x(!0),!E.natives&&e.natives&&v(!0)},y.isInstalled=function(e){return!!E[e]},y.isRegExp=function(e){return"[object RegExp]"===H.call(e)},y.match=function(e,t,n){var r,a,o=t.global&&"one"!==n||"all"===n,s=(o?"g":"")+(t.sticky?"y":"")||"noGY";return t[w]=t[w]||{},a=t[w][s]||(t[w][s]=i(t,{addG:!!o,addY:!!t.sticky,removeG:"one"===n,isInternalOnly:!0})),r=S.match.call(b(e),a),t.global&&(t.lastIndex="one"===n&&r?r.index+r[0].length:0),o?r||[]:r&&r[0]},y.matchChain=function(e,t){return function n(e,r){var i,a=t[r].regex?t[r]:{regex:t[r]},o=[],s=function(e){if(a.backref){if(!(e.hasOwnProperty(a.backref)||+a.backref<e.length))throw new ReferenceError("Backreference to undefined group: "+a.backref);o.push(e[a.backref]||"")}else o.push(e[0])};for(i=0;i<e.length;++i)y.forEach(e[i],a.regex,s);return r!==t.length-1&&o.length?n(o,r+1):o}([e],0)},y.replace=function(e,t,n,r){var a,o=y.isRegExp(t),s=t.global&&"one"!==r||"all"===r,l=(s?"g":"")+(t.sticky?"y":"")||"noGY",u=t;return o?(t[w]=t[w]||{},u=t[w][l]||(t[w][l]=i(t,{addG:!!s,addY:!!t.sticky,removeG:"one"===r,isInternalOnly:!0}))):s&&(u=new RegExp(y.escape(String(t)),"g")),a=k.replace.call(b(e),u,n),o&&t.global&&(t.lastIndex=0),a},y.replaceEach=function(e,t){var n,r;for(n=0;n<t.length;++n)r=t[n],e=y.replace(e,r[0],r[1],r[2]);return e},y.split=function(e,t,n){return k.split.call(b(e),t,n)},y.test=function(e,t,n,r){return!!y.exec(e,t,n,r)},y.uninstall=function(e){e=d(e),E.astral&&e.astral&&x(!1),E.natives&&e.natives&&v(!1)},y.union=function(e,t){var n,r,i,a,o=/(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*]/g,s=[],l=0,u=function(e,t,i){var a=r[l-n];if(t){if(++l,a)return"(?<"+a+">"}else if(i)return"\\"+(+i+n);return e};if(!c(e,"Array")||!e.length)throw new TypeError("Must provide a nonempty array of patterns to merge");for(a=0;a<e.length;++a)i=e[a],y.isRegExp(i)?(n=l,r=i[w]&&i[w].captureNames||[],s.push(S.replace.call(y(i.source).source,o,u))):s.push(y.escape(i));return y(s.join("|"),t)},k.exec=function(e){var t,n,r,a=this.lastIndex,o=S.exec.apply(this,arguments);if(o){if(!j&&o.length>1&&u(o,"")>-1&&(n=i(this,{removeG:!0,isInternalOnly:!0}),S.replace.call(String(e).slice(o.index),n,function(){var e,t=arguments.length;for(e=1;t-2>e;++e)void 0===arguments[e]&&(o[e]=void 0)})),this[w]&&this[w].captureNames)for(r=1;r<o.length;++r)t=this[w].captureNames[r-1],t&&(o[t]=o[r]);this.global&&!o[0].length&&this.lastIndex>o.index&&(this.lastIndex=o.index)}return this.global||(this.lastIndex=a),o},k.test=function(e){return!!k.exec.call(this,e)},k.match=function(e){var t;if(y.isRegExp(e)){if(e.global)return t=S.match.apply(this,arguments),e.lastIndex=0,t}else e=new RegExp(e);return k.exec.call(e,b(this))},k.replace=function(e,t){var n,r,i,a=y.isRegExp(e);return a?(e[w]&&(r=e[w].captureNames),n=e.lastIndex):e+="",i=c(t,"Function")?S.replace.call(String(this),e,function(){var n,i=arguments;if(r)for(i[0]=new String(i[0]),n=0;n<r.length;++n)r[n]&&(i[0][r[n]]=i[n+1]);return a&&e.global&&(e.lastIndex=i[i.length-2]+i[0].length),t.apply(void 0,i)}):S.replace.call(null==this?this:String(this),e,function(){var e=arguments;return S.replace.call(String(t),_,function(t,n,i){var a;if(n){if(a=+n,a<=e.length-3)return e[a]||"";if(a=r?u(r,n):-1,0>a)throw new SyntaxError("Backreference to undefined group "+t);return e[a+1]||""}if("$"===i)return"$";if("&"===i||0===+i)return e[0];if("`"===i)return e[e.length-1].slice(0,e[e.length-2]);if("'"===i)return e[e.length-1].slice(e[e.length-2]+e[0].length);if(i=+i,!isNaN(i)){if(i>e.length-3)throw new SyntaxError("Backreference to undefined group "+t);return e[i]||""}throw new SyntaxError("Invalid token "+t)})}),a&&(e.global?e.lastIndex=0:e.lastIndex=n),i},k.split=function(e,t){if(!y.isRegExp(e))return S.split.apply(this,arguments);var n,r=String(this),i=[],a=e.lastIndex,o=0;return t=(void 0===t?-1:t)>>>0,y.forEach(r,e,function(e){e.index+e[0].length>o&&(i.push(r.slice(o,e.index)),e.length>1&&e.index<r.length&&Array.prototype.push.apply(i,e.slice(1)),n=e[0].length,o=e.index+n)}),o===r.length?(!S.test.call(e,"")||n)&&i.push(""):i.push(r.slice(o)),e.lastIndex=a,i.length>t?i.slice(0,t):i},y.addToken(/\\([ABCE-RTUVXYZaeg-mopqyz]|c(?![A-Za-z])|u(?![\dA-Fa-f]{4}|{[\dA-Fa-f]+})|x(?![\dA-Fa-f]{2}))/,function(e,t){if("B"===e[1]&&t===R)return e[0];throw new SyntaxError("Invalid escape "+e[0])},{scope:"all",leadChar:"\\"}),y.addToken(/\\u{([\dA-Fa-f]+)}/,function(e,t,n){var r=a(e[1]);if(r>1114111)throw new SyntaxError("Invalid Unicode code point "+e[0]);if(65535>=r)return"\\u"+g(l(r));if(A&&n.indexOf("u")>-1)return e[0];throw new SyntaxError("Cannot use Unicode code point above \\u{FFFF} without flag u")},{scope:"all",leadChar:"\\"}),y.addToken(/\[(\^?)]/,function(e){return e[1]?"[\\s\\S]":"\\b\\B"},{leadChar:"["}),y.addToken(/\(\?#[^)]*\)/,function(e,t,n){return f(e.input,e.index+e[0].length,n)?"":"(?:)"},{leadChar:"("}),y.addToken(/\s+|#.*/,function(e,t,n){return f(e.input,e.index+e[0].length,n)?"":"(?:)"},{flag:"x"}),y.addToken(/\./,function(){return"[\\s\\S]"},{flag:"s",leadChar:"."}),y.addToken(/\\k<([\w$]+)>/,function(e){var t=isNaN(e[1])?u(this.captureNames,e[1])+1:+e[1],n=e.index+e[0].length;if(!t||t>this.captureNames.length)throw new SyntaxError("Backreference to undefined group "+e[0]);return"\\"+t+(n===e.input.length||isNaN(e.input.charAt(n))?"":"(?:)")},{leadChar:"\\"}),y.addToken(/\\(\d+)/,function(e,t){if(!(t===R&&/^[1-9]/.test(e[1])&&+e[1]<=this.captureNames.length)&&"0"!==e[1])throw new SyntaxError("Cannot use octal escape or backreference to undefined group "+e[0]);return e[0]},{scope:"all",leadChar:"\\"}),y.addToken(/\(\?P?<([\w$]+)>/,function(e){if(!isNaN(e[1]))throw new SyntaxError("Cannot use integer as capture name "+e[0]);if("length"===e[1]||"__proto__"===e[1])throw new SyntaxError("Cannot use reserved word as capture name "+e[0]);if(u(this.captureNames,e[1])>-1)throw new SyntaxError("Cannot use same name for multiple groups "+e[0]);return this.captureNames.push(e[1]),this.hasNamedCapture=!0,"("},{leadChar:"("}),y.addToken(/\((?!\?)/,function(e,t,n){return n.indexOf("n")>-1?"(?:":(this.captureNames.push(null),"(")},{optionalFlags:"n",leadChar:"("}),e.exports=y},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(6);Object.keys(r).forEach(function(e){"default"!==e&&Object.defineProperty(t,e,{enumerable:!0,get:function(){return r[e]}})});var i=n(7);Object.keys(i).forEach(function(e){"default"!==e&&Object.defineProperty(t,e,{enumerable:!0,get:function(){return i[e]}})})},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();t.Match=function(){function e(t,r,i){n(this,e),this.value=t,this.index=r,this.length=t.length,this.css=i,this.brushName=null}return r(e,[{key:"toString",value:function(){return this.value}}]),e}()},function(e,t,n){"use strict";function r(e,t){var n=[];t=t||[];for(var r=0,o=t.length;o>r;r++)"object"===i(t[r])&&(n=n.concat((0,a.find)(e,t[r])));return n=(0,a.sort)(n),n=(0,a.removeNested)(n),n=(0,a.compact)(n)}Object.defineProperty(t,"__esModule",{value:!0});var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};t.applyRegexList=r;var a=n(8)},function(e,t,n){"use strict";function r(e,t){function n(e,t){return e[0]}for(var r=null,i=[],a=t.func?t.func:n,o=0;r=l.XRegExp.exec(e,t.regex,o);){var u=a(r,t);"string"==typeof u&&(u=[new s.Match(u,r.index,t.css)]),i=i.concat(u),o=r.index+r[0].length}return i}function i(e){function t(e,t){return e.index<t.index?-1:e.index>t.index?1:e.length<t.length?-1:e.length>t.length?1:0}return e.sort(t)}function a(e){var t,n,r=[];for(t=0,n=e.length;n>t;t++)e[t]&&r.push(e[t]);return r}function o(e){for(var t=0,n=e.length;n>t;t++)if(null!==e[t])for(var r=e[t],i=r.index+r.length,a=t+1,n=e.length;n>a&&null!==e[t];a++){var o=e[a];if(null!==o){if(o.index>i)break;o.index==r.index&&o.length>r.length?e[t]=null:o.index>=r.index&&o.index<i&&(e[a]=null)}}return e}Object.defineProperty(t,"__esModule",{value:!0}),t.find=r,t.sort=i,t.compact=a,t.removeNested=o;var s=n(6),l=n(3)},function(e,t){"use strict";function n(e,t){for(var n=e.toString();n.length<t;)n="0"+n;return n}function r(e){return e.split(/\r?\n/)}function i(e){var t,n,r,i={};for(t=e.highlight||[],"function"!=typeof t.push&&(t=[t]),r=0,n=t.length;n>r;r++)i[t[r]]=!0;return i}function a(e,t,n){var a=this;a.opts=n,a.code=e,a.matches=t,a.lines=r(e),a.linesToHighlight=i(n)}Object.defineProperty(t,"__esModule",{value:!0}),t["default"]=a,a.prototype={wrapLinesWithCode:function(e,t){if(null==e||0==e.length||"\n"==e||null==t)return e;var n,i,a,o,s,l=this,u=[];for(e=e.replace(/</g,"&lt;"),e=e.replace(/ {2,}/g,function(e){for(a="",o=0,s=e.length;s-1>o;o++)a+=l.opts.space;return a+" "}),n=r(e),o=0,s=n.length;s>o;o++)i=n[o],a="",i.length>0&&(i=i.replace(/^(&nbsp;| )+/,function(e){return a=e,""}),i=0===i.length?a:a+'<code class="'+t+'">'+i+"</code>"),u.push(i);return u.join("\n")},processUrls:function(e){var t=/(.*)((&gt;|&lt;).*)/,n=/\w+:\/\/[\w-.\/?%&=:@;#]*/g;return e.replace(n,function(e){var n="",r=null;return(r=t.exec(e))&&(e=r[1],n=r[2]),'<a href="'+e+'">'+e+"</a>"+n})},figureOutLineNumbers:function(e){var t,n,r=[],i=this.lines,a=parseInt(this.opts.firstLine||1);for(t=0,n=i.length;n>t;t++)r.push(t+a);return r},wrapLine:function(e,t,n){var r=["line","number"+t,"index"+e,"alt"+(t%2==0?1:2).toString()];return this.linesToHighlight[t]&&r.push("highlighted"),0==t&&r.push("break"),'<div class="'+r.join(" ")+'">'+n+"</div>"},renderLineNumbers:function(e,t){var r,i,a=this,o=a.opts,s="",l=a.lines.length,u=parseInt(o.firstLine||1),c=o.padLineNumbers;for(1==c?c=(u+l-1).toString().length:1==isNaN(c)&&(c=0),i=0;l>i;i++)r=t?t[i]:u+i,e=0==r?o.space:n(r,c),s+=a.wrapLine(i,r,e);return s},getCodeLinesHtml:function(e,t){for(var n=this,i=n.opts,a=r(e),o=(i.padLineNumbers,parseInt(i.firstLine||1)),s=i.brush,e="",l=0,u=a.length;u>l;l++){var c=a[l],f=/^(&nbsp;|\s)+/.exec(c),g=null,p=t?t[l]:o+l;null!=f&&(g=f[0].toString(),c=c.substr(g.length),g=g.replace(" ",i.space)),0==c.length&&(c=i.space),e+=n.wrapLine(l,p,(null!=g?'<code class="'+s+' spaces">'+g+"</code>":"")+c)}return e},getTitleHtml:function(e){return e?"<caption>"+e+"</caption>":""},getMatchesHtml:function(e,t){function n(e){var t=e?e.brushName||c:c;return t?t+" ":""}var r,i,a,o,s=this,l=0,u="",c=s.opts.brush||"";for(a=0,o=t.length;o>a;a++)r=t[a],null!==r&&0!==r.length&&(i=n(r),u+=s.wrapLinesWithCode(e.substr(l,r.index-l),i+"plain")+s.wrapLinesWithCode(r.value,i+r.css),l=r.index+r.length+(r.offset||0));return u+=s.wrapLinesWithCode(e.substr(l),n()+"plain")},getHtml:function(){var e,t,n,r=this,i=r.opts,a=r.code,o=r.matches,s=["syntaxhighlighter"];return i.collapse===!0&&s.push("collapsed"),t=i.gutter!==!1,t||s.push("nogutter"),s.push(i.className),s.push(i.brush),t&&(e=r.figureOutLineNumbers(a)),n=r.getMatchesHtml(a,o),n=r.getCodeLinesHtml(n,e),i.autoLinks&&(n=r.processUrls(n)),n='\n      <div class="'+s.join(" ")+'">\n        <table border="0" cellpadding="0" cellspacing="0">\n          '+r.getTitleHtml(i.title)+"\n          <tbody>\n            <tr>\n              "+(t?'<td class="gutter">'+r.renderLineNumbers(a)+"</td>":"")+'\n              <td class="code">\n                <div class="container">'+n+"</div>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    "}}},function(e,t){"use strict";function n(e){return e.split(/\r?\n/)}function r(e,t){for(var r=n(e),i=0,a=r.length;a>i;i++)r[i]=t(r[i],i);return r.join("\n")}function i(e){return(e||"")+Math.round(1e6*Math.random()).toString()}function a(e,t){var n,r={};for(n in e)r[n]=e[n];for(n in t)r[n]=t[n];return r}function o(e){return e.replace(/^\s+|\s+$/g,"")}function s(e){return Array.prototype.slice.apply(e)}function l(e){var t={"true":!0,"false":!1}[e];return null==t?e:t}e.exports={splitLines:n,eachLine:r,guid:i,merge:a,trim:o,toArray:s,toBoolean:l}},function(e,t,n){"use strict";var r=n(12),i=n(13),a=n(14),o=n(15),s=n(16);e.exports=function(e,t){e=r(e,t),e=i(e,t),e=a(e,t),e=o.unindent(e,t);var n=t["tab-size"];return e=t["smart-tabs"]===!0?s.smart(e,n):s.regular(e,n)}},function(e,t){"use strict";e.exports=function(e,t){return e.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g,"").replace(/\r/g," ")}},function(e,t){"use strict";e.exports=function(e,t){var n=/<br\s*\/?>|&lt;br\s*\/?&gt;/gi;return t.bloggerMode===!0&&(e=e.replace(n,"\n")),e}},function(e,t){"use strict";e.exports=function(e,t){var n=/<br\s*\/?>|&lt;br\s*\/?&gt;/gi;return t.stripBrs===!0&&(e=e.replace(n,"")),e}},function(e,t){"use strict";function n(e){return/^\s*$/.test(e)}e.exports={unindent:function(e){var t,r,i,a,o=e.split(/\r?\n/),s=/^\s*/,l=1e3;for(i=0,a=o.length;a>i&&l>0;i++)if(t=o[i],!n(t)){if(r=s.exec(t),null==r)return e;l=Math.min(r[0].length,l)}if(l>0)for(i=0,a=o.length;a>i;i++)n(o[i])||(o[i]=o[i].substr(l));return o.join("\n")}}},function(e,t){"use strict";function n(e,t,n){return e.substr(0,t)+r.substr(0,n)+e.substr(t+1,e.length)}for(var r="",i=0;50>i;i++)r+="                    ";e.exports={smart:function(e,t){var r,i,a,o,s=e.split(/\r?\n/),l="	";for(a=0,o=s.length;o>a;a++)if(r=s[a],-1!==r.indexOf(l)){for(i=0;-1!==(i=r.indexOf(l));)r=n(r,i,t-i%t);s[a]=r}return s.join("\n")},regular:function(e,t){return e.replace(/\t/g,r.substr(0,t))}}},function(e,t){"use strict";function n(){for(var e=document.getElementsByTagName("script"),t=[],n=0;n<e.length;n++)("text/syntaxhighlighter"==e[n].type||"syntaxhighlighter"==e[n].type)&&t.push(e[n]);return t}function r(e,t){return-1!=e.className.indexOf(t)}function i(e,t){r(e,t)||(e.className+=" "+t)}function a(e,t){e.className=e.className.replace(t,"")}function o(e,t,n,r){function i(e){e=e||window.event,e.target||(e.target=e.srcElement,e.preventDefault=function(){this.returnValue=!1}),n.call(r||window,e)}e.attachEvent?e.attachEvent("on"+t,i):e.addEventListener(t,i,!1)}function s(e,t,n){if(null==e)return null;var r,i,a=1!=n?e.childNodes:[e.parentNode],o={"#":"id",".":"className"}[t.substr(0,1)]||"nodeName";if(r="nodeName"!=o?t.substr(1):t.toUpperCase(),-1!=(e[o]||"").indexOf(r))return e;for(var l=0,u=a.length;a&&u>l&&null==i;l++)i=s(a[l],t,n);return i}function l(e,t){return s(e,t,!0)}function u(e,t,n,r,i){var a=(screen.width-n)/2,o=(screen.height-r)/2;i+=", left="+a+", top="+o+", width="+n+", height="+r,i=i.replace(/^,/,"");var s=window.open(e,t,i);return s.focus(),s}function c(e){return document.getElementsByTagName(e)}function f(e){var t,n,r=c(e.tagName);if(e.useScriptTags)for(t=c("script"),n=0;n<t.length;n++)t[n].type.match(/^(text\/)?syntaxhighlighter$/)&&r.push(t[n]);return r}function g(e){return document.createElement(e)}function p(e){var t=e.target,n=l(t,".syntaxhighlighter"),r=l(t,".container"),u=document.createElement("textarea");if(r&&n&&!s(r,"textarea")){i(n,"source");for(var c=r.childNodes,f=[],g=0,p=c.length;p>g;g++)f.push(c[g].innerText||c[g].textContent);f=f.join("\r"),f=f.replace(/\u00a0/g," "),u.readOnly=!0,u.appendChild(document.createTextNode(f)),r.appendChild(u),u.focus(),u.select(),o(u,"blur",function(e){u.parentNode.removeChild(u),a(n,"source")})}}e.exports={quickCodeHandler:p,create:g,popup:u,hasClass:r,addClass:i,removeClass:a,attachEvent:o,findElement:s,findParentElement:l,getSyntaxHighlighterScriptTags:n,findElementsToHighlight:f}},function(e,t){"use strict";e.exports={space:"&nbsp;",useScriptTags:!0,bloggerMode:!1,stripBrs:!1,tagName:"pre"}},function(e,t){"use strict";e.exports={"class-name":"","first-line":1,"pad-line-numbers":!1,highlight:null,title:null,"smart-tabs":!0,"tab-size":4,gutter:!0,"quick-code":!0,collapse:!1,"auto-links":!1,unindent:!0,"html-script":!1}},function(e,t,n){(function(t){"use strict";function r(e,t){function n(e,t){for(var n=0,r=e.length;r>n;n++)e[n].index+=t}function r(e,r){function o(e){u=u.concat(e)}var s,l=e.code,u=[],c=a.regexList,f=e.index+e.left.length,g=a.htmlScript;s=i(l,c),n(s,f),o(s),null!=g.left&&null!=e.left&&(s=i(e.left,[g.left]),n(s,e.index),o(s)),null!=g.right&&null!=e.right&&(s=i(e.right,[g.right]),n(s,e.index+e[0].lastIndexOf(e.right)),o(s));for(var p=0,d=u.length;d>p;p++)u[p].brushName=t.brushName;return u}var a,o=new e;if(null!=t){if(a=new t,null==a.htmlScript)throw new Error("Brush wasn't configured for html-script option: "+t.brushName);o.regexList.push({regex:a.htmlScript.code,func:r}),this.regexList=o.regexList}}var i=n(5).applyRegexList;e.exports=r}).call(t,n(21))},function(e,t){"use strict";function n(){f&&u&&(f=!1,u.length?c=u.concat(c):g=-1,c.length&&r())}function r(){if(!f){var e=o(n);f=!0;for(var t=c.length;t;){for(u=c,c=[];++g<t;)u&&u[g].run();g=-1,t=c.length}u=null,f=!1,s(e)}}function i(e,t){this.fun=e,this.array=t}function a(){}var o,s,l=e.exports={};!function(){try{o=setTimeout}catch(e){o=function(){throw new Error("setTimeout is not defined")}}try{s=clearTimeout}catch(e){s=function(){throw new Error("clearTimeout is not defined")}}}();var u,c=[],f=!1,g=-1;l.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];c.push(new i(e,t)),1!==c.length||f||o(r,0)},i.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=a,l.addListener=a,l.once=a,l.off=a,l.removeListener=a,l.removeAllListeners=a,l.emit=a,l.binding=function(e){throw new Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(e){throw new Error("process.chdir is not supported")},l.umask=function(){return 0}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(9),s=r(o),l=n(3),u=n(5);e.exports=function(){function e(){i(this,e)}return a(e,[{key:"getKeywords",value:function(e){var t=e.replace(/^\s+|\s+$/g,"").replace(/\s+/g,"|");return"\\b(?:"+t+")\\b"}},{key:"forHtmlScript",value:function(e){var t={end:e.right.source};e.eof&&(t.end="(?:(?:"+t.end+")|$)"),this.htmlScript={left:{regex:e.left,css:"script"},right:{regex:e.right,css:"script"},code:(0,l.XRegExp)("(?<left>"+e.left.source+")(?<code>.*?)(?<right>"+t.end+")","sgi")}}},{key:"getHtml",value:function(e){var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],n=(0,u.applyRegexList)(e,this.regexList),r=new s["default"](e,n,t);return r.getHtml()}}]),e}()},function(e,t,n){"use strict";function r(){var e="break case catch class continue default delete do else enum export extends false  for from as function if implements import in instanceof interface let new null package private protected static return super switch this throw true try typeof var while with yield";this.regexList=[{regex:a.multiLineDoubleQuotedString,css:"string"},{regex:a.multiLineSingleQuotedString,css:"string"},{regex:a.singleLineCComments,css:"comments"},{regex:a.multiLineCComments,css:"comments"},{regex:/\s*#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(e),"gm"),css:"keyword"}],this.forHtmlScript(a.scriptScriptTags)}var i=n(22),a=n(3).commonRegExp;r.prototype=new i,r.aliases=["js","jscript","javascript","json"],e.exports=r},function(e,t,n){"use strict";function r(){function e(e){return"\\b([a-z_]|)"+e.replace(/ /g,"(?=:)\\b|\\b([a-z_\\*]|\\*|)")+"(?=:)\\b"}function t(e){return"\\b"+e.replace(/ /g,"(?!-)(?!:)\\b|\\b()")+":\\b"}var n="ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index",r="above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow",i="[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";
this.regexList=[{regex:a.multiLineCComments,css:"comments"},{regex:a.doubleQuotedString,css:"string"},{regex:a.singleQuotedString,css:"string"},{regex:/\#[a-fA-F0-9]{3,6}/g,css:"value"},{regex:/(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,css:"value"},{regex:/!important/g,css:"color3"},{regex:new RegExp(e(n),"gm"),css:"keyword"},{regex:new RegExp(t(r),"g"),css:"value"},{regex:new RegExp(this.getKeywords(i),"g"),css:"color1"}],this.forHtmlScript({left:/(&lt;|<)\s*style.*?(&gt;|>)/gi,right:/(&lt;|<)\/\s*style\s*(&gt;|>)/gi})}var i=n(22),a=n(3).commonRegExp;r.prototype=new i,r.aliases=["css"],e.exports=r},function(e,t,n){"use strict";function r(){function e(e,t){var n=e[0],r=o.exec(n,o("(&lt;|<)[\\s\\/\\?!]*(?<name>[:\\w-\\.]+)","xg")),i=[];if(null!=e.attributes)for(var a,l=0,u=o("(?<name> [\\w:.-]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)","xg");null!=(a=o.exec(n,u,l));)i.push(new s(a.name,e.index+a.index,"color1")),i.push(new s(a.value,e.index+a.index+a[0].indexOf(a.value),"string")),l=a.index+a[0].length;return null!=r&&i.push(new s(r.name,e.index+r[0].indexOf(r.name),"keyword")),i}this.regexList=[{regex:o("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)","gm"),css:"color2"},{regex:a.xmlComments,css:"comments"},{regex:o("(&lt;|<)[\\s\\/\\?!]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)","sg"),func:e}]}var i=n(22),a=n(3).commonRegExp,o=n(3).XRegExp,s=n(5).Match;r.prototype=new i,r.aliases=["xml","xhtml","xslt","html","plist"],e.exports=r},function(e,t,n){"use strict";"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};!function(t,n){e.exports=n()}("domready",function(){var e,t=[],n=document,r=n.documentElement.doScroll,i="DOMContentLoaded",a=(r?/^loaded|^c/:/^loaded|^i|^c/).test(n.readyState);return a||n.addEventListener(i,e=function(){for(n.removeEventListener(i,e),a=1;e=t.shift();)e()}),function(e){a?setTimeout(e,0):t.push(e)}})},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=t.string=function(e){return e.replace(/^([A-Z])/g,function(e,t){return t.toLowerCase()}).replace(/([A-Z])/g,function(e,t){return"-"+t.toLowerCase()})};t.object=function(e){var t={};return Object.keys(e).forEach(function(r){return t[n(r)]=e[r]}),t}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}var i=n(1),a=r(i);window.SyntaxHighlighter=a["default"],"undefined"==typeof window.XRegExp&&(window.XRegExp=n(3).XRegExp)}]);


// View demo source code

function attachPopupHandler( popup, sources ) {
	popup.one( "popupbeforeposition", function() {
		var
			collapsibleSet = popup.find( "[data-role='collapsibleset']" ),
			collapsible, pre;

		$.each( sources, function( idx, options ) {
			collapsible = $( "<div data-role='collapsible' data-collapsed='true' data-theme='" + options.theme + "' data-iconpos='right' data-collapsed-icon='caret-l' data-expanded-icon='caret-d' data-content-theme='b'>" +
					"<h1>" + options.title + "</h1>" +
					"<pre class='brush: " + options.brush + ";'></pre>" +
				"</div>" );
			pre = collapsible.find( "pre" );
			pre.append( options.data.replace( /</gmi, '&lt;' ) );
			collapsible
				.appendTo( collapsibleSet )
				.on( "collapsiblecollapse", function() {
					popup.popup( "reposition", { positionTo: "window" } );
				})
				.on( "collapsibleexpand", function() {
					var doReposition = true;

					collapsibleSet.find( ":mobile-collapsible" ).not( this ).each( function() {
						if ( $( this ).collapsible( "option", "expanded" ) ) {
							doReposition = false;
						}
					});

					if ( doReposition ) {
						popup.popup( "reposition", { positionTo: "window" } );
					}
				});
			SyntaxHighlighter.highlight( {}, pre[ 0 ] );
		});

		collapsibleSet.find( "[data-role='collapsible']" ).first().attr( "data-collapsed", "false" );
		popup.enhanceWithin();
	});
}

function getSnippet( type, selector, source ) {
	var text = "", el, absUrl, hash;

	if ( selector === "true" ) {
		selector = "";
	}

	// First, try to grab a tag in this document
	if ( !$.mobile.path.isPath( selector ) ) {
		el = source.find( ( "markup" === type ? "" : type ) + selector );
		// If this is not an embedded style, try a stylesheet reference
		if ( el.length === 0 && type === "style" ) {
			el = source.find( "link[rel='stylesheet']" + selector );
		}

		// Stringify each element and cache the string representation on the element. This helps us
		// avoid re-stringifying the element later. This, in turn, prevents us from re-stringifying
		// already enhanced elements, such as shared widgets outside the page, when the View Source
		// button is in the page, and the elements have already been enhanced when the View Source
		// button is created. This assumes, of course, that the first time we stringify an element
		// the element is not yet enhanced.
		el.each( function( index, singleElement ) {
			var whitespace,
				single = $( this ),
				singleText = single.jqmData( "viewSourceCachedData" );

			if ( !singleText ) {
				singleText = $( "<div></div>" )
						.append( ( "markup" === type ? single : single.contents() ).clone() )
						.html();

				// If we're dealing with markup, retrieve the initial indentation of the element so
				// we get proper indentation in the source view
				if ( type === "markup" ) {
					if ( this.previousSibling && this.previousSibling.nodeType === 3 ) {
						whitespace = $( "<div>" )
							.append( $( this.previousSibling ).clone() )
							.html()
							.match( /\n(\s*)$/ );
						if ( whitespace && whitespace.length > 1 ) {
							singleText = whitespace[ 1 ] + singleText;
						}
					}
				}
				single.jqmData( "viewSourceCachedData", singleText );
			}

			text = text +

				// Separate the text for multiple elements with a newline
				( index > 0 ? "\n" : "" ) +
				singleText;
		});
		if ( !text ) {
			text = "";
			selector = el.attr( "href" ) || el.attr( "src" ) || "";
		}
	}

	// If not, try to SJAX in the document referred to by the selector
	if ( !text && selector ) {
		absUrl = $.mobile.path.makeUrlAbsolute( selector );
		hash = $.mobile.path.parseUrl( absUrl ).hash;

		// selector is a path to SJAX in
		$.ajax( absUrl, { async: false, dataType: "text" } )
			.success( function( data, textStatus, jqXHR ) {
				text = data;
				// If there's a hash we assume this is an HTML document that has a tag
				// inside whose ID is the hash
				if ( hash ) {
					text = $( "<div></div>" ).append( $( data ).find( hash ).contents().clone() ).html();
				}
			});
	}

	return text;
}

$( document ).bind( "pagebeforechange", function( e, data ) {
	var popup, sources;
	if ( data.options && data.options.role === "popup" && data.options.link ) {
		sources = data.options.link.jqmData( "sources" );
		if ( sources ) {
			popup = $( "<div id='jqm-view-source' class='jqm-view-source' data-role='popup' data-theme='none' data-position-to='window'>" +
								"<div data-role='collapsibleset' data-inset='true'></div>" +
							"</div>" );

			attachPopupHandler( popup, sources );
			popup
				.appendTo( "body" )
				.popup()
				.bind( "popupafterclose", function() {
					popup.remove();
				})
				.popup( "open" );

			e.preventDefault();
		}
	}
});

function makeButton() {
	var d = document.createElement( "div" )
		a = document.createElement( "a" ),
		txt = document.createTextNode( " View Source" ),
		icon = document.createElement( "span" );

	d.className = "jqm-view-source-link-container";
	a.className = "jqm-view-source-link ui-button ui-corner-all ui-button-inline ui-mini ui-alt-icon ui-nodisc-icon";
	icon.className = "ui-icon ui-icon-eye";

	a.setAttribute( "href", "#popupDemo" );
	a.setAttribute( "data-rel", "popup" );
	a.appendChild( icon );
	a.appendChild( txt );

	d.appendChild( a );

	return $( d );
}

$.fn.viewSourceCode = function() {
	return $( this ).each( function() {
		var button = makeButton(),
			self = $( this ),
			snippetSource = self.parents( ".ui-page,:jqmData(role='page')" ).add( $( "head" ) ),
			fixData = function( data ) {
				return data.replace( /\s+$/gm, "" );
			},
			data,
			sources = [];

		// Collect source code before it becomes enhanced

		if ( self.is( "[data-demo-html]" ) ) {
			if ( self.attr( "data-demo-html" ) === "true" ) {
				data = self.html();
			} else {
				data = getSnippet( "markup", self.attr( "data-demo-html" ), $( document ) );
			}
			sources.push( { title: "HTML", theme: "c", brush: "xml", data: fixData( data ) } );
		}

		if ( self.is( "[data-demo-php]" ) ) {
			$.ajax( self.attr( "data-demo-php" ), { async: false } )
				.success( function( incoming ) {
					data = incoming;
				})
				.error( function() {
					data = "// Failed to retrieve PHP source code";
				});

			sources.push( { title: "PHP", theme: "d", brush: "php", data: fixData( data ) } );
		}

		if ( self.is( "[data-demo-js]" ) ) {
			data = getSnippet( "script", self.attr( "data-demo-js" ), snippetSource );
			sources.push( { title: "JS", theme: "e", brush: "js", data: fixData( data ) } );
		}

		if ( self.is( "[data-demo-css]" ) ) {
			data = getSnippet( "style", self.attr( "data-demo-css" ), snippetSource );
			sources.push( { title: "CSS", theme: "f", brush: "css", data: fixData( data ) } );
		}

		button.insertAfter( this );
		button.children().jqmData( "sources", sources );
	});
};

$( document ).on( "pagebeforecreate", "[data-role='page']", function() {
	$( this ).find( "[data-demo-html], [data-demo-js], [data-demo-css], [data-demo-php]" ).viewSourceCode();
});

$( document )
	// reposition when switching between html / js / css
	.on( "collapsibleexpand", ".jqm-view-source .ui-collapsible", function() {
		$( this ).parents( ":mobile-popup" ).popup( "reposition", { positionTo: "window" } );
	})
	.on( "popupbeforeposition", ".jqm-view-source", function() {
		// max height: screen height - tolerance (2*30px) - 42px for each collapsible heading
		var x = $( this ).find( ".ui-collapsible" ).length,
			maxHeight = $( window ).height() - 60 - ( x * 42 );

		$( this ).find( ".ui-collapsible-content" ).css( "max-height", maxHeight + "px" );

		// keep line numbers and code lines in sync
		$(".ui-collapsible:not(.ui-collapsible-collapsed) .gutter", this ).find( ".line" ).css( "height", "");

		$(".ui-collapsible:not(.ui-collapsible-collapsed) .code", this ).find( ".line" ).each( function() {
			if ( $( this ).height() !== 16 ) {
				var height = $( this ).height(),
					linenumber = ".number" + /number(\w+)/.exec( this.className )[1],
					gutter = $( this ).parents( "tr" ).find( "td.gutter" ).first(),
					line = $( gutter ).find( linenumber );

				$( line ).height( height );
			}
		});
	})
	.on( "pagecreate", function( e ) {
		// prevent page scroll while scrolling source code
		$( document ).on( "mousewheel", ".jqm-view-source .ui-collapsible-content", function( event, delta ) {
			if ( delta > 0 && $( this ).scrollTop() === 0 ) {
				event.preventDefault();
			} else if ( delta < 0 &&  $( this ).scrollTop() === $( this ).get( 0 ).scrollHeight - $( this ).innerHeight() ) {
				event.preventDefault();
			}
		});
	});

/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */

(function($) {
	var types = ['DOMMouseScroll', 'mousewheel'];

	if ($.event.fixHooks) {
		for ( var i=types.length; i; ) {
			$.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
		}
	}
	$.event.special.mousewheel = {
		setup: function() {
			if ( this.addEventListener ) {
				for ( var i=types.length; i; ) {
					this.addEventListener( types[--i], handler, false );
				}
			} else {
				this.onmousewheel = handler;
			}
		},
		teardown: function() {
			if ( this.removeEventListener ) {
				for ( var i=types.length; i; ) {
					this.removeEventListener( types[--i], handler, false );
				}
			} else {
				this.onmousewheel = null;
			}
		}
	};
	$.fn.extend({
		mousewheel: function(fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},

		unmousewheel: function(fn) {
			return this.unbind("mousewheel", fn);
		}
	});
	function handler(event) {
		var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
		event = $.event.fix(orgEvent);
		event.type = "mousewheel";

		// Old school scrollwheel delta
		if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
		if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
		// New school multidimensional scroll (touchpads) deltas
		deltaY = delta;
		// Gecko
		if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
			deltaY = 0;
			deltaX = -1*delta;
		}
		// Webkit
		if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
		if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
		// Add event and delta to the front of the arguments
		args.unshift(event, delta, deltaX, deltaY);

		return ($.event.dispatch || $.event.handle).apply(this, args);
	}
})(jQuery);


(function( $, undefined ) {
	//special click handling to make widget work remove after nav changes in 1.4
	var href,
		ele = "";
	$( document ).on( "click", "a", function() {
		href = $( this ).attr( "href" );
		var hash = $.mobile.path.parseUrl( href );
		if( typeof href !== "undefined" && hash !== "" && href !== href.replace( hash,"" ) && hash.search( "/" ) !== -1 ){
			//remove the hash from the link to allow normal loading of the page.
			var newHref = href.replace( hash,"" );
			$( this ).attr( "href", newHref );
		}
		ele = $( this );
	});
	$( document ).on( "pagebeforechange", function( e, f ){
			f.originalHref = href;
	});
	$( document ).on("pagebeforechange", function( e,f ){
		var hash = $.mobile.path.parseUrl(f.toPage).hash,
			hashEl, hashElInPage;

		try {
			hashEl = $( hash );
		} catch( err ) {
			hashEl = $();
		}

		try {
			hashElInPage = $( ".ui-page-active " + hash );
		} catch( err ) {
			hashElInPage = $();
		}

		if( typeof hash !== "undefined" &&
			hash.search( "/" ) === -1 &&
			hash !== "" &&
			hashEl.length > 0 &&
			!hashEl.hasClass( "ui-page" ) &&
			!hashEl.hasClass( "ui-popup" ) &&
			hashEl.data( "role" ) !== "page" &&
			!hashElInPage.hasClass( "ui-panel" ) &&
			!hashElInPage.hasClass( "ui-popup" ) ) {
			//scroll to the id
			var pos = hashEl.offset().top;
			$.mobile.silentScroll( pos );
			$.mobile.navigate( hash, "", true );
		} else if( typeof f.toPage !== "object" &&
			hash !== "" &&
			$.mobile.path.parseUrl( href ).hash !== "" &&
			!hashEl.hasClass( "ui-page" ) && hashEl.attr( "data-role" ) !== "page" &&
			!hashElInPage.hasClass( "ui-panel" ) &&
			!hashElInPage.hasClass( "ui-popup" ) ) {
			$( ele ).attr( "href", href );
			$.mobile.document.one( "pagechange", function() {
				if( typeof hash !== "undefined" &&
					hash.search( "/" ) === -1 &&
					hash !== "" &&
					hashEl.length > 0 &&
					hashElInPage.length > 0 &&
					!hashEl.hasClass( "ui-page" ) &&
					hashEl.data( "role" ) !== "page" &&
					!hashElInPage.hasClass( "ui-panel" ) &&
					!hashElInPage.hasClass( "ui-popup" ) ) {
					hash = $.mobile.path.parseUrl( href ).hash;
					var pos = hashElInPage.offset().top;
					$.mobile.silentScroll( pos );
				}
			} );
		}
	});
	$( document ).on( "mobileinit", function(){
		var hash = window.location.hash;
		$.mobile.document.one( "pageshow", function(){
			var hashEl, hashElInPage;

			try {
				hashEl = $( hash );
			} catch( e ) {
				hashEl = $();
			}

			try {
				hashElInPage = $( ".ui-page-active " + hash );
			} catch( e ) {
				hashElInPage = $();
			}

			if( hash !== "" &&
				hashEl.length > 0 &&
				hashElInPage.length > 0 &&
				hashEl.attr( "data-role" ) !== "page" &&
				!hashEl.hasClass( "ui-page" ) &&
				!hashElInPage.hasClass( "ui-panel" ) &&
				!hashElInPage.hasClass( "ui-popup" ) &&
				!hashEl.is( "body" ) ){
				var pos = hashElInPage.offset().top;
				setTimeout( function(){
					$.mobile.silentScroll( pos );
				}, 100 );
			}
		});
	});
	//h2 widget
	$( document ).on( "mobileinit", function(){
		$.widget( "mobile.h2linker", {
			options:{
				initSelector: ":jqmData(quicklinks='true')"
			},

			_create:function(){
				var self = this,
					bodyid = "ui-page-top",
					panel = "<div data-role='panel' class='jqm-quicklink-panel' data-position='left' data-display='overlay' data-theme='a'><ul data-role='listview' data-inset='false' data-theme='a' data-divider-theme='a' data-icon='false'><li data-role='list-divider'>Table of Contents</li></ul></div>",
					first = true,
					h2dictionary = {};
					if(typeof $("body").attr("id") === "undefined"){
						$("body").attr("id",bodyid);
					} else {
						bodyid =  $("body").attr("id");
					}
					this.element.find("div.jqm-content>h2").each(function(){
						var id, text = $(this).text();

						if(typeof $(this).attr("id") === "undefined"){
							id = text.replace(/[^\.a-z0-9:_-]+/gi,"");
							$(this).attr( "id", id );
						} else {
							id = $(this).attr("id");
						}

						h2dictionary[id] =  text;
						if(!first){
							$(this).before( "<div class='jqm-top-link-container'><span><a href='#" + bodyid + "' class='jqm-top-link ui-nodisc-icon ui-alt-icon'>Top <span class='ui-icon ui-icon-arrow-u'></span></a></span></div>");
						} else {
							$(this).before("<a href='#' data-ajax='false' class='jqm-toc-link jqm-open-quicklink-panel ui-nodisc-icon ui-alt-icon'><span class='ui-icon ui-icon-caret-r'></span> Table of Contents</a>");
						}
						first = false;
					});
					this._on(".jqm-open-quicklink-panel", {
						"click": function(){
							$(".ui-page-active .jqm-quicklink-panel").panel("open");
							$(".ui-page-active").addClass("jqm-demos-quicklink-panel-open");
							return false;
						}
					});
					this._on( document, {
						"pagebeforechange": function(){
							this.element.find(".jqm-quicklink-panel").panel("close");
							this.element.find(".jqm-quicklink-panel .ui-button-active").removeClass("ui-button-active");
						}
					});
					if( $(h2dictionary).length > 0 ){
						this.element.append(panel);
						this.element.find(".jqm-quicklink-panel").panel().find("ul").listview();
					}
					$.each(h2dictionary,function(id,text){
						self.element.find(".jqm-quicklink-panel ul").append("<li><a href='#"+id+"'>"+text+"</a></li>");
					});
					self.element.find(".jqm-quicklink-panel ul").listview("refresh");

			}
		});
	});
	$( document ).bind( "pagecreate create", function( e ) {
		if($(e.target).data("quicklinks")){
			$(e.target).h2linker();
		}
	});
})( jQuery );


