export default class Vector {
	constructor(x, y) {
    	this.x = x;
        this.y = y;
    }
    
    scale(scale) {
    	return new Vector(this.x * scale, this.y * scale);
    }
    
    rotate(angle) {
    	return new Vector(
        	Math.cos(angle) * this.x - Math.sin(angle) * this.y,
            Math.sin(angle) * this.x + Math.cos(angle) * this.y
        );
    }
    
    add(vector) {
    	return new Vector(
        	this.x + vector.x,
            this.y + vector.y
        );
    }

    sub(vector) {
        return new Vector(
            this.x - vector.x,
            this.y - vector.y
        );
    }
}
