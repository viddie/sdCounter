var fontMagnitudes = {
	"0": [70, 0],
	"1": [70, 0],
	"2": [70, 4],
	"3": [56, 4],
	"4": [46, 4],
	"5": [37, 3],
	"6": [32, 2],
	"7": [29, 2],
	"other": [25, 2],
};

function getFontSizeForNumber(num){
	let magnitude = 1;
	if(num != 0){
		magnitude = Math.floor(Math.log10(Math.abs(num)));
	}
				
	let fontSize = fontMagnitudes[""+magnitude][0];
	if(fontSize === undefined){
		fontSize = fontMagnitudes.other[0];
	}
				
	if(num < 0 && magnitude > 1){
		fontSize -= fontMagnitudes[""+magnitude][1] || 2;
	}
	
	return fontSize;
}