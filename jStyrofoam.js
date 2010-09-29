/**
 * @projectDescription
 * 
 * jStyrofoam provides an animated clientside filter.
 *
 * Copyright (c) 2008-2010 Martin Krause (jquery.public.mkrause.info)
 * Dual licensed under the MIT and GPL licenses.
 *
 * @author Martin Krause public@mkrause.info
 * @copyright Martin Krause (jquery.public.mkrause.info)
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 * @license GNU http://www.gnu.org/licenses/gpl-3.0.html
 * 
 */
(function($) {

	// plugin definition
	//
	$.fn.jStyrofoam = function(oOptions_) {
	
		// build main options before element iteration
		var _oOpts = $.extend({}, $.fn.jStyrofoam.oDefaults, oOptions_);


		// iterate and reformat each matched element
		return this.each(function() {
			var _$this = $(this);
			
			// force - but keep current - id
			var _sId = _$this.attr('id');
			if (!_sId  || _sId  === null || _sId  == 'null') { 
				_sId = _$this.attr('id','jStyrofoam-'+new Date().getTime()).attr('id');
			}
			// set up storage to enable multiple effect elements on a single page 
			$.fn.jStyrofoam.TEMP_ID = _sId;
			$.fn.jStyrofoam._STORAGE[_sId] = {};
			$.fn.jStyrofoam._STORAGE[_sId].oOptions = _oOpts;
			$.fn.jStyrofoam._STORAGE[_sId].oOptions.sIdCollection = _sId;
			$.fn.jStyrofoam._STORAGE[_sId].oOptions.$eljStyrofoam = _$this;
			$.fn.jStyrofoam._STORAGE[_sId].elements = {};
				
			// set height to prevent the whole page jumping during animations
			_$this.css('height',_$this.outerHeight());
			
			// get value for 'position'
			// since we're using position: absolute on all animated items 
			// the wrapper needs a positon != static
			var _cssPosition = _$this.css('position');
			// reformat animation items to position: absolute
			// but setup rapper and animation items first
			jQuery.fn.jStyrofoam.reversePositionAbsolute(
				_$this
					// set position value if necessary
					.css('position', (_cssPosition === 'static' ? 'relative' : _cssPosition) )
					// set click events
					.find(' .'+_oOpts.sClassNameTrigger)
						.bind('click.jStyrofoam',{ sIdCollection : _sId },$.fn.jStyrofoam.click)
					.end()
					// get all sortable elements
					.find(_oOpts.sElement)
						.each(function (iIndex_) {
							$(this).attr('id','jStyrofoam-'+_sId+'-'+ iIndex_ )
						})

					)
				// discarde current id
				$.fn.jStyrofoam.TEMP_ID = null;
			});
			
	};

	// private functions
	
	/**
	 * Hides elements by moving them to their start position and applying a fade out.
	 * @param {jQuery-Elements} $elements_
	 * @return {Void}
	 */
	function _animateToStart ($elements_) {

		$elements_	

			.each(function(iIndex_,element_) {

				// get single element
				var _$element = jQuery(element_);

				// get metadata by element id
 					var _oIds = _getIds(_$element.attr('id'));
				var _oStart = $.fn.jStyrofoam._STORAGE[_oIds.id].elements[_oIds.eId];
				
				// set up and execute reset animation
				_$element
 					// set visible
					.css('opacity',1)
					// animate
					.animate({
						'left': _oStart.left,
						'top': _oStart.top
					},{queue: false})
					.fadeOut('normal')
		});	
	};

	/**
	 * Retrieve collection id by using the element id
	 * @param {String} sElementId_
	 * @return {Object}, { eId: element id , id: collection id}
	 */
	function _getIds (sElementId_) {
		return {eId:sElementId_ , id:sElementId_.split('jStyrofoam-')[1].split('-')[0] };
	};

	
	/**
	 * Performs animation and sorting on click event.
	 * @param {jQuery-Element} $element, event.target
	 * @param {jQuery-Element} $eljStyrofoam_, wrapper element
	 * @return {Void}
	 */
	function _doClick ($element,sIdCollection_) {
		
		// extract selector from rel-attribute
		var _sSelector =$element.attr('rel');
		
		// get current stored metadata by collection id
		var _oStored = $.fn.jStyrofoam._STORAGE[sIdCollection_];
		var _sActiveSelector = _oStored.sActiveSelector;
		
		// just clicked on the current filter again
		if (_sActiveSelector == _sSelector ) {return false; }

		// set active classes 
		jQuery('#'+_oStored.oOptions.sIdCollection +' .'+_oStored.oOptions.sClassNameTrigger).removeClass(_oStored.oOptions.sClassNameActive);
		$element.addClass(_oStored.oOptions.sClassNameActive);

		// set active
		$.fn.jStyrofoam._STORAGE[sIdCollection_].sActiveSelector = _sSelector;

		// cache current options
		var _oOpts = _oStored.oOptions;
		// store properties
		var _iElementWidth = _oOpts.iElementWidth;
		var _iElementHeight = _oOpts.iElementHeight;
		var _iElementsPerRow =  _oOpts.iElementsPerRow;
		var _$eljStyrofoam = _oOpts.$eljStyrofoam;
		var _iRow = 0;
		
		// get all elements to perform an action by using the selector(rel) on the classname 
		var _$elActions = _$eljStyrofoam.find([_oOpts.sElement,'[class*="',_sSelector,'"]'].join(''));
		// stop animation on all elements to show
		_$elActions.stop(true)
		
		// reset all element that arent part of the current filtered 
		_animateToStart( _$eljStyrofoam.find(_oOpts.sElement).not(['[class*="',_sSelector,'"]'].join('')).stop(true) )
		
		// go
		_$elActions
			.each(function(iIndex_,element_) {
				// get single element
				var _$element = jQuery(element_);

				// get jStyrofoam metadata by collection id
					var _oIds = _getIds(_$element.attr('id'));
				var _oStart = $.fn.jStyrofoam._STORAGE[_oIds.id].elements[_oIds.eId];
				
				// get filter-related position to animate element to
				// relies on a correct formatted classname
				var _iPos = parseInt( _$element.attr('class').split(_sSelector)[1].split(" ")[0] );
				// set start position for a visible element: keep visibility and current position 
				if (_$element.is(':visible')) {
					_$element
						.css({
							// keep opacity on already visible elements
		 					'opacity': 1  
						})
				}
				// set start position for invisible elements to fade in during the animation 
				else {
					_$element
						.css({
							// hide
		 					'opacity':  0 ,
							// elements are resetted to these positions, but enforce a correct start 
							'left': _oStart.left,
							'top': _oStart.top
						})
				}
					_$element
					// set start values for always fade in elements
 					// a nice fade ...
					.fadeIn('normal')
					// ... and a smooth animation
					.animate({
						'opacity' : 1,
						'left': _iElementWidth * ( ( _iPos  -1 ) % _iElementsPerRow ),
						'top': _iElementHeight * ( ( Math.ceil(   _iPos   / _iElementsPerRow) )-1 ) 
					},{queue: false})
		 
		})
		return false;
	};
	
	// public functions

	/**
	 * Click handler. Intercepts click event. 
	 * Override $.fn.jStyrofoam.beforeClickAnimation 
	 * or $.fn.jStyrofoam.afterClickAnimation to modify the behaviour.
	 * Bridge to _doClick
	 * @param {Event} event_
	 * @return {Boolean}, false
	 */
	$.fn.jStyrofoam.click = function(event_) {
		// stub, override 
		$.fn.jStyrofoam.beforeClickAnimation(event_);
		// perform action on click
		_doClick(jQuery(event_.target),(event_.data.sIdCollection) ) ;
		// stub, override 
		$.fn.jStyrofoam.afterClickAnimation(event_);
		return false;
	};
	
	/**
	 * Stub,override to perform actions onClick but before the animation starts.
	 * @param {Event} event_
	 * @return {Void}
	 */
	$.fn.jStyrofoam.beforeClickAnimation = function(event_) {
		// STUB
	};

	/**
	 * Stub,override to perform actions onClick after the animation has been finished.
	 * @param {Event} event_
	 * @return {Void}
	 */
	$.fn.jStyrofoam.afterClickAnimation= function(event_) {
		// STUB			
	};
	
	/**
	 * Set elements to position: absolute, use reverse order due to browser behaviour.
	 * @param {jQuery-Elements}, $elements_
	 * @return {Void}
	 */
	$.fn.jStyrofoam.reversePositionAbsolute = function($elements_) {

		jQuery($elements_.get().reverse()).each(function(iIndex_, element_) {
			// extend element
			var _$element = jQuery(element_);
			// grab position
			var _oPos = _$element.position();
			// store element metadata using the collection id and the element id 
			$.fn.jStyrofoam._STORAGE[$.fn.jStyrofoam.TEMP_ID].elements[_$element.attr('id')] = {left: _oPos.left, top:_oPos.top}
			// set position to absolute, remove float
			jQuery(element_).css({
				'top': _oPos.top,
				'left': _oPos.left,
				'position': 'absolute',
				'float': 'none'
			})

		})
		
		
	};

	// storage container
	$.fn.jStyrofoam._STORAGE = {};		

	// plugin defaults
	$.fn.jStyrofoam.oDefaults = {
		/*sSelectorTrigger: 'a.action[rel]',*/
		iElementWidth: 160,
		iElementHeight: 110,
		iElementsPerRow: 5,
		sElement: '.toFilter li',
		sClassNameTrigger:'action',
		sClassNameActive:'active'
	};
})(jQuery);