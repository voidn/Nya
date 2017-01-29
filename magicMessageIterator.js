//iterator for magic text
/* Type Class */
function Vector2 (x, y){

    if (x === undefined) { this.x = 0;} else {this.x = x}
    if (y === undefined) { this.y = 0;} else {this.y = y}
}

function Rect (x,y, height, width){
    
    if (x === undefined) { this.x = 0;} else {this.x = x}
    if (y === undefined) { this.y = 0;} else {this.y = y}
    if (height === undefined) { this.height = 0;} else {this.height = height}
    if (width === undefined) { this.width = 0;} else {this.width = width}
}
var Display = function Display (){
        /* Shit Scope is Shit */
    var self = this;

    /* Border Drawing Crap */
    this.dimensions = new Vector2(29, 13);
    this.borderChars = { "h":  "═", "v":  "║",
                            "tl": "╔", "tr": "╗",
                            "bl": "╚", "br": "╝",
                            "vl": "╠", "vr": "╣",
                            "ht": "╦", "hb": "╩",
                            "q": "╬", "b":  " "};

    this.hBars = [];
    this.vBars = [];

    /* Class Wrappers */
    this.Vector2 = Vector2;
    this.Rect = Rect;
    
    /* Classes */
    this.textBlock = function(text, rect, textDimensions, scroll, transparent){
        
        if (text === undefined) {this.text = []} else{this.text = text}
        if (rect === undefined) {this.rect = new Rect(0, 0, self.dimensions.y, self.dimensions.x)} else{this.rect = rect}
        if (textDimensions === undefined) {this.textDimensions = new Vector2(0, 0)} else{this.textDimensions = textDimensions}
        if (scroll === undefined) {this.scroll = new Vector2(0, 0)} else{this.scroll = scroll}
        if (transparent === undefined) {this.transparent = false} else{this.transparent = transparent}
    };
    
    /* General Vars */
    this.textBlocks = {"primary": new this.textBlock()};
    this.clocks = [];
    this.coordinates = new Vector2();
    
    /* Utilities */
    this.loadFromFile = function (filePath, name, vCenter, hCenter, rect, textDimensions, scroll, transparent){

        if (name === undefined) {name = "primary";}
        if (vCenter === undefined) {vCenter = true;}
        if (hCenter === undefined) {hCenter = true;}

        var f = fs.readFileSync(filePath).toString();
        var blockValues = [this.dimensions.x, this.dimensions.y, 0, 0, this.dimensions.x, this.dimensions.y, 0, 0]
        
        f = f.split("\r").join("").split("\n");
        
        index = 0;
        temp = [];
        
        currentX = blockValues[4];
        
        for( i = 0; i < f.length; i++){
            
            var t = f[i].split("");
            if (i != 0 || (t[0] != "@" && i == 0)){
                temp[index] = t;
                currentX = Math.max(t.length, currentX)}
            else{
                
                
                index--;
                
                t = t.join("").slice(1);
                
                try{
                    t = t.split(",");
                    
                    for(ii=0;ii<t.length;ii++){
                        if(ii == 5){ blockValues[5] = Math.max(parseInt(t[5]), blockValues[5]);}
                        else{blockValues[ii] = parseInt(t[ii]);}
                    }
                } catch(err){}
            }
            t = [];
            index++;
        }
        
        f = temp;
        
        blockValues[4] = Math.max(currentX, blockValues[4]);
        
        tb = new this.textBlock(f, rect, textDimensions, scroll, transparent);
       
        for(i=0; i<8; i++){
            switch(i){
                case 0:
                    if(rect === undefined)tb.rect.width = blockValues[i];
                    break;
                case 1:
                    if(rect === undefined) tb.rect.height = blockValues[i];
                    break;
                case 2:
                    if(rect === undefined) tb.rect.x = blockValues[i];
                    break;
                case 3:
                    if(rect === undefined) tb.rect.y = blockValues[i];
                    break;
                case 4:
                    if(textDimensions === undefined) tb.textDimensions.x = blockValues[i];
                    break;
                case 5:
                    if(textDimensions === undefined) tb.textDimensions.y = blockValues[i];
                    break;
                case 6:
                    if(scroll === undefined) tb.scroll.x = blockValues[i];
                    break;
                case 7:
                    if(scroll === undefined) tb.scroll.y = blockValues[i];
                    break;
            }
        }
        
        this.textBlocks[name] = tb;
        
        return this.padTextBlockArray(name, vCenter, hCenter);
    }
    
    this.loadFromString = function(s, name, vCenter, hCenter, rect, textDimensions, scroll, transparent){
        
        if (name === undefined) {name = "primary";}
        if (vCenter === undefined) {vCenter = true;}
        if (hCenter === undefined) {hCenter = true;}
        if (textDimensions === undefined) {textDimensions = new Vector2(this.dimensions.x, this.dimensions.y);}
        
        s = s.split("\n");
        x = 0;

        for(i=0;i<s.length;i++){
            s[i] = s[i].split("");
            x = Math.max(x, s[i].length);
        }
                
        tb = new this.textBlock(s, rect, new Vector2(Math.max(textDimensions.x, x), Math.max(textDimensions.y, s.length)), scroll, transparent);
        this.textBlocks[name] = tb;
        this.textBlocks[name].text = this.padTextBlockArray(name, vCenter, hCenter);
        
        return tb.text;
    }
    
    this.padTextBlockArray = function (arrayBlock, vCenter, hCenter, height, width){
        
        ref = arrayBlock;
        arrayBlock = this.textBlocks[arrayBlock];
        
        if (width === undefined) {width = this.textBlocks[ref].textDimensions.x}
        if (height === undefined) {height = this.textBlocks[ref].textDimensions.y}
        if (vCenter === undefined) {vCenter = true;}
        if (hCenter === undefined) {hCenter = true;}

        arrayBlock = arrayBlock.text;

        vDiff = height-arrayBlock.length;
        vDiff = Math.max(0, vDiff);
        vDiff = Math.min(this.dimensions.y, vDiff);
        
        if(vCenter){           
            before = Math.floor(vDiff/2)-1, after = Math.ceil(vDiff/2)+1;
            
            for(i=0;i<before;i++){ arrayBlock = [Array(width+1).join(" ").split("")].concat(arrayBlock);}
            for(i=0;i<after;i++){ arrayBlock = arrayBlock.concat([Array(width+1).join(" ").split("")]);}
        } else{
            for(i=0;i<vDiff;i++){ arrayBlock = arrayBlock.concat([Array(width+1).join(" ").split("")]);}
        }
        
                    
        for(i=0;i<arrayBlock.length;i++){
  
            hDiff = width-arrayBlock[i].length+1;
            hDiff = Math.max(0, hDiff);
            hDiff = Math.min(this.dimensions.x, hDiff);
            
            if(hCenter){
                    before = Math.floor(hDiff/2), after = Math.ceil(hDiff/2);

                    arrayBlock[i] = Array(before+1).join(" ").split("").concat(arrayBlock[i]);
                    arrayBlock[i] = arrayBlock[i].concat(Array(after+1).join(" ").split(""));
            } else {
                arrayBlock[i] = [" "].concat(arrayBlock[i].concat(Array(hDiff).join(" ").split("")));
            }
        }
        
        return arrayBlock;
    }
    
    this.deleteTextBlock = function(name){
        delete this.textBlocks[name];
    }
    
    this.mergeArrayBlock = function (arrayBlock){

        if(typeof(arrayBlock) === "string"){return arrayBlock}
    
        for(i = 0; i < arrayBlock.length; i++){
            try{arrayBlock[i] = arrayBlock[i].join("");}
            catch(err){print(err, i)}
        }
        
        return arrayBlock.join("\n");
    }
    
    this.startClock = function (clockName, speed, task){
    
        var args = [];
        for( i=0; i<arguments.length; i++){
            if(i>2){
            
                args[i-3] = arguments[i];
            }
        }
        
        this.clocks[clockName] = setInterval(function() {
            task.apply(this, args);
        }, speed);
    }
    
    this.stopClock = function (clockName){
    
        clearInterval(this.clocks[clockName]);
    }
    
    /* General Display Functions */
    this.drawBorder = function (contentArray, arrayModeOff){
    
        if (arrayModeOff === undefined) {arrayModeOff = false;}
        
        for(i = 0; i < contentArray.length; i++){
            if(i == 0){
            
                contentArray[i] = [this.borderChars.tl].concat(Array(this.dimensions.x-1).join(this.borderChars.h).split("")).concat([this.borderChars.tr]);
            } else if(i == contentArray.length - 1){
            
                contentArray[i] = [this.borderChars.bl].concat(Array(this.dimensions.x-1).join(this.borderChars.h).split("")).concat([this.borderChars.br]);
            } else{
                
                contentArray[i][0] = this.borderChars.v;
                contentArray[i][contentArray[i].length-1] = this.borderChars.v;
            }
            
            if(this.hBars.indexOf(i) != -1){ contentArray[i] = [this.borderChars.vl].concat(Array(this.dimensions.x-1).join(this.borderChars.h).split("")).concat([this.borderChars.vr])};
            if(this.vBars){
                
                for(ii=0;ii<this.dimensions.x;ii++){
                
                    if(this.vBars.indexOf(ii) != -1 && this.hBars.indexOf(i) != -1){contentArray[i][ii] = this.borderChars.q}
                    else if(this.vBars.indexOf(ii) != -1 && i == 0){contentArray[i][ii] = this.borderChars.ht}
                    else if(this.vBars.indexOf(ii) != -1 && i == this.dimensions.y-1){contentArray[i][ii] = this.borderChars.hb}
                    else if(this.vBars.indexOf(ii) != -1){contentArray[i][ii] = this.borderChars.v}
                }
            }
        }
        
        
        
        if(!arrayModeOff){ return contentArray;}
        else{ return this.mergeArrayBlock(contentArray);}
    }
    
    this.drawDisplay = function (contentArray){
    
        var displayContent = [];
        
        for(i=0;i<this.dimensions.y;i++){displayContent[i] = Array(this.dimensions.x+1).join(" ").split("");}
        for(var property in this.textBlocks){
                                   
            var rect = this.textBlocks[property].rect;
            var dim = this.textBlocks[property].textDimensions;
            var coords = this.textBlocks[property].scroll;
        
            coords.x = coords.x%dim.x;
            coords.y = coords.y%dim.y;
            
            var newX = coords.x+dim.x-1;
            var newY = coords.y+dim.y-1;

            if (rect.y == 0){index = 0}else{index = 1}
           
            for( i = 0; i < this.dimensions.y; i++){
                if (rect.y <= i && i < rect.y+rect.height){
                        var y = (newY+1+i)%this.textBlocks[property].text.length;
                        
                        temp = [];
                        
                        temp = this.textBlocks[property].text[y].slice(newX%dim.x, Math.min(((newX%dim.x) + Math.min(this.dimensions.x, dim.x)), this.textBlocks[property].text[y].length));
                        
                        if(((newX%this.textBlocks[property].text[y].length)+this.dimensions.x) > this.textBlocks[property].text[y].length){
                            temp = temp.concat(this.textBlocks[property].text[y].slice(0, ((newX%this.textBlocks[property].text[y].length) + Math.min(this.dimensions.x, dim.x)) - this.textBlocks[property].text[y].length));
                        }

                        for(ii=0; ii<temp.length;ii++){
                            
                            if(((this.textBlocks[property].transparent && (temp[ii] != "" && temp[ii] != " ")) || (!this.textBlocks[property].transparent)) && ii+rect.x < this.dimensions.x && ii+rect.x < rect.x + rect.width){ displayContent[i][ii+rect.x] = temp[ii];}
                        }
                        
                        index++;
                }
            }
        }
        
        return displayContent;
    }
    
    this.drawBorderedDisplay = function (contentArray, coords, arrayModeOff){
    
        if (arrayModeOff === undefined) {arrayModeOff = false;}
        
        var disp = this.drawDisplay(contentArray, coords);
        contentArray = this.drawBorder(disp);
        
        if(arrayModeOff){ return contentArray;}
        else{ return this.mergeArrayBlock(contentArray);}
    }
}  