function Play(x, y, player_size, c) {
  this.pos = createVector(x, y);
  this.r = player_size; 
	
  this.eat = function(other, enenmy_colour){
   	 let enemy_size = p5.Vector.dist(this.pos, other.pos);

    if(enemy_size < this.r){
      this.r = this.r + 1; 
      return true;

    }else{
      return false;
    }
  }
  
  this.update = function(speed) {
    let dir = createVector(mouseX - width/2, mouseY - height/2);
    dir.setMag(speed);
    this.pos.add(dir);

    //can't go outside of stadium
    if (this.pos.x > 3000 || this.pos.x == 3000) {
      this.pos.x = 3000-1;

    } else if (this.pos.y > 3000 || this.pos.y == 3000) {
      this.pos.y = 3000-1;

    } else if (this.pos.x < -3000 || this.pos.x == -3000) {
      this.pos.x = -3000+1;

    } else if (this.pos.y < -3000 || this.pos.y == -3000) {
      this.pos.y = -3000+1;
    }
  }

  this.constrain = function(){
    player.pos.x = constrain(player.pos.x, -width, width);
    player.pos.y = constrain(player.pos.y, -height, height);
  }

  this.show = function() {
    fill(c);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  }

  this.colour = function(){
    return c;
  }
}