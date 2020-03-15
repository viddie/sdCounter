$SD.on('connected', conn => connected(conn));

function connected (jsn) {
    console.log('Connected Plugin:', jsn);

    /** subscribe to the willAppear event */
    $SD.on('com.viddie.counter.action.willAppear', jsonObj =>
        action.onWillAppear(jsonObj)
    );
    $SD.on('com.viddie.counter.action.keyDown', jsonObj =>
        action.onKeyDown(jsonObj)
    );
    $SD.on('com.viddie.counter.action.keyUp', jsonObj =>
        action.onKeyUp(jsonObj)
    );
    $SD.on('com.viddie.counter.action.sendToPlugin', jsonObj =>
        action.onSendToPlugin(jsonObj)
    );
}

    	var action = {
			type : "com.viddie.counter.action",
			
			cache: {},
			defaultHandleObj: {
				timer: null,
				canvas: null,
				ctxFilter: null,
				hadLongPress: false,
				
				settings: {
					currentValue: 0,
					stepSize: 1,
					longPressStepSize: -1,
				},
			},
			
			getHandleObjFromCache: function(context){
				let handleObj = this.cache[context];
				if(handleObj === undefined){
					handleObj = JSON.parse(JSON.stringify(this.defaultHandleObj));
					this.cache[context] = handleObj;
				}
				return handleObj;
			},
			
			onKeyDown : function(jsonObj) {
				var context = jsonObj.context;
				let handleObj = this.getHandleObjFromCache(context);
                
				handleObj.timer = setTimeout(function () {
					handleObj.hadLongPress = true;
					handleObj.settings.currentValue += handleObj.settings.longPressStepSize;
					
					action.updateSettings(context, {currentValue: handleObj.settings.currentValue});
					action.displayCounterValue(context, handleObj.settings.currentValue);
				},500);
			},
			
			onKeyUp : function(jsonObj) {
			    var context = jsonObj.context;
			    var settings = jsonObj.payload.settings;
				let handleObj = this.getHandleObjFromCache(context);
				
                clearTimeout(handleObj.timer);
				
				if(handleObj.hadLongPress){
					handleObj.hadLongPress = false;
					return;
				}
				
				handleObj.settings.currentValue += handleObj.settings.stepSize;
					
				action.updateSettings(context, {currentValue: handleObj.settings.currentValue});
				action.displayCounterValue(context, handleObj.settings.currentValue);
			},
			
			onWillAppear : function(jsonObj) {
				var context = jsonObj.context;
			    var settings = jsonObj.payload.settings;
				let handleObj = this.getHandleObjFromCache(context);
				
				if(settings != null){
					if(settings.hasOwnProperty('currentValue')){
						handleObj.settings.currentValue = parseInt(settings["currentValue"]) || 0;
					}
					if(settings.hasOwnProperty('stepSize')){
						handleObj.settings.stepSize = parseInt(settings["stepSize"]) || 1;
					}
					if(settings.hasOwnProperty('longPressStepSize')){
						handleObj.settings.longPressStepSize = parseInt(settings["longPressStepSize"]) || -1;
					}
				}
				
				this.displayCounterValue(context, handleObj.settings.currentValue);
			},
			
			onSendToPlugin: function(jsonObj){
				var context = jsonObj.context;
				let handleObj = this.getHandleObjFromCache(context);
				
				if (jsonObj.payload.hasOwnProperty('DATAREQUEST')) {
					$SD.api.sendToPropertyInspector(
						jsonObj.context,
						{
							currentValue: handleObj.settings.currentValue,
							stepSize: handleObj.settings.stepSize,
							longPressStepSize: handleObj.settings.longPressStepSize,
						},
						this.type
					);
				} else {
					if (jsonObj.payload.hasOwnProperty('currentValue')) {
						handleObj.settings.currentValue = parseInt(jsonObj.payload['currentValue']) || 0;
					}
					if (jsonObj.payload.hasOwnProperty('stepSize')) {
						handleObj.settings.stepSize = parseInt(jsonObj.payload['stepSize']) || 1;
					}
					if (jsonObj.payload.hasOwnProperty('longPressStepSize')) {
						handleObj.settings.longPressStepSize = parseInt(jsonObj.payload['longPressStepSize']) || -1;
					}
					
					action.updateSettings(context, {
						currentValue: handleObj.settings.currentValue,
						stepSize: handleObj.settings.stepSize,
						longPressStepSize: handleObj.settings.longPressStepSize,
					});
				}
			},
			
			displayCounterValue : function(context, num){
				let handleObj = this.getHandleObjFromCache(context);
				
				if(handleObj.canvas === null){
					handleObj.canvas = document.getElementById("canvas");
				}
				
				let ctx = handleObj.canvas.getContext("2d");
				if(handleObj.ctxFilter === null) handleObj.ctxFilter = ctx.filter;
				
				ctx.filter = handleObj.ctxFilter;
				ctx.fillStyle = "#0A1423";
				ctx.fillRect(0, 0, handleObj.canvas.width, handleObj.canvas.height);
				
					
				let fontSize = getFontSizeForNumber(num);
				
				ctx.fillStyle = "#3A6CDF";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.font = fontSize+"px Arial";
				ctx.fillText(""+num, handleObj.canvas.width/2, handleObj.canvas.height/2);
				$SD.api.setImage(context, handleObj.canvas.toDataURL());
			},
			
			/* Helper function to set settings while keeping all other fields unchanged */
			updateSettings: function(context, settings){
				let handleObj = this.getHandleObjFromCache(context);
				let updatedSettings = handleObj.settings;
				
				for(let field in settings){
					updatedSettings[field] = settings[field];
				}
				
				$SD.api.setSettings(context, updatedSettings);
			},
		};