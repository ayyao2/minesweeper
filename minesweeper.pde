import java.util.ArrayList;

int flags = 40;
int rows = 14;
int columns = 14;
int squares = rows * columns;
int numClicks = 0;
String game = "";
Square[][] field = new Square[14][14];
int flagCount = flags;

void setup() {
    size(600, 400);
    background(0,0,0);
    fill(255,255,255);
    textSize(30);
    text("Minesweeper", 175, 30);
    System.out.println("Minesweeper");
    for(int i = 0; i < field.length; i++) {
        for(int j = 0; j < field[0].length; j++) {
            field[i][j] = new Square(random(), i, j);
            if(field[i][j].isMine()) {
                System.out.print("-");
            }
            else {
                System.out.print("0");
            }
        }
        System.out.println();
    }
    ArrayList<Square> zeros = new ArrayList<Square>();
    fill(220,220,220);
    for(Square[] row : field) {
        for(Square s : row) {
             rect(125 + 20 * s.getCol(), 50 + 20 * s.getRow(), 20, 20);
            if(number(s).equals("")) {zeros.add(s);}
        }
    }
    Square temp = zeros.get((int)(Math.random()*zeros.size()-1));
    fill(0,255,0);
    rect(temp.getXPos(), temp.getYPos(), 20, 20);
    System.out.println("flags: " + flags);
    System.out.println("squares: " + squares);
}
void draw() {
    
}

void newGame() {
    flags = 40;
    rows = 14;
    columns = 14;
    squares = rows * columns;
    numClicks = 0;
    game = "";
    field = new Square[14][14];
    setup();
}

void mouseClicked() {
    Square square = null;
    for(Square[] row : field) {
        for(Square s : row) {
            if(mouseX < s.getXPos()+20 && mouseX >= s.getXPos() && mouseY < s.getYPos()+20 && mouseY >= s.getYPos()) {
                square = s;
            }
        }
    }
    if(square != null) {
        if(mouseButton == LEFT) {reveal(square);}
        if(mouseButton == RIGHT && !square.isClick()) {
            square.changeFlag();
        } 
    }
}

String number(Square square) {
    int mines = 0;
    if(square.getRow() != 0 && square.getRow() != rows-1 && square.getCol() != 0 && square.getCol() != columns-1) {
        for(int i = square.getRow()-1; i <= square.getRow()+1; i++) {
            for(int j = square.getCol()-1; j<=square.getCol()+1; j++) {
                if(field[i][j].isMine()) {
                    mines++;
                }
            }
        }
    }
    else {
        int i = square.getRow()-1;
        int j = square.getCol()-1;
        int endR = square.getRow()+1;
        int endC = square.getCol()+1;
        if(endR >= rows) {endR--;}
        if(endC >= columns) {endC--;}
        if(i < 0) {i++;}
        if(j < 0) {j++;}
        while(i <= endR) {
            while(j <= endC) {
                if(field[i][j].isMine()) {mines++;}
                    j++;
                }
            i++;
            j = square.getCol()-1;
            if(j < 0) {j++;}
        }
    }
    if(mines == 0) {return "";}
    return "" + mines;
}

void reveal(Square square) {
            if (!square.isFlag()) {
                if(square.isMine()){
                    //game over
                    newGame();
                }
                else {
                    square.clicked();
                    numClicks++;
                    fill(150,150,150);
                    rect(square.getXPos(), square.getYPos(), 20, 20);
                    textSize(15);
                    fill(0, 50, 0);
                    text(number(square), square.getXPos() + 7, square.getYPos() + 15);
                    if(numClicks == squares - flags) {newGame();}
                    if(number(square).equals("")) {
                        if(square.getRow() != 0 && square.getRow() != rows-1 && square.getCol() != 0 && square.getCol() != columns-1) {
                            for(int i=square.getRow()-1; i<=square.getRow()+1; i++) {
                                for(int j=square.getCol()-1; j<=square.getCol()+1; j++) {
                                    if((i != square.getRow() || j != square.getCol()) && !field[i][j].isClick()) {reveal(field[i][j]);}
                            }
                        }
                    }
                    else{
                        int i = square.getRow()-1;
                        int j = square.getCol()-1;
                        if(i < 0) {i++;}
                        if(j < 0) {j++;}
                        int endR = square.getRow()+1;
                        int endC = square.getCol()+1;
                        if(endR >= rows) {endR--;}
                        if(endC >= columns) {endC--;}
                        while(i <= endR) {
                            while(j <= endC) {
                                if((i != square.getRow() || j != square.getCol()) && !field[i][j].isClick()) {reveal(field[i][j]);}
                                j++;
                            }
                            i++;
                            j = square.getCol()-1;
                            if(j < 0) {j++;}
                        }
                    }
                }
                //show the number
            }
    }
}

boolean random() {
    int x = (int)(Math.random()*squares);
    if(x < flags) {
        flags--;
        squares--;
        return true;
    }
    squares--;
    return false;
}

class Square {
    private boolean mine;
    private boolean flag = false;
    private boolean click = false;
    private int row;
    private int column;
    private int xPos;
    private int yPos;

    public Square (boolean mine, int row, int column) {
        this.mine = mine;
        this.row = row;
        this.column = column;
        xPos = 125 + 20 * column;
        yPos = 50 + 20 * row; 
    }
    public boolean isMine() {
        return mine;
    }
    public boolean isFlag() {
        return flag;
    }
    public boolean isClick() {
        return click;
    }
    public int getRow() {
        return row;
    }
    public int getCol() {
        return column;
    }
    public void changeFlag() {
        flag = !flag;
        if(flag) {
            flagCount--;
            fill(255,0,0);
            rect(xPos, yPos, 20, 20);
        }
        else {
            flagCount++;
            fill(220, 220, 220);
            rect(xPos, yPos, 20, 20);
        }
    }
    public void clicked() {
        click = true;
    }
    public int getXPos() {
        return xPos;
    }
    public int getYPos() {
        return yPos;
    }
}
