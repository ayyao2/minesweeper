import java.awt.Color;
import java.awt.Insets;
import javax.swing.JButton;

public class Square extends JButton {
    private boolean mine;
    private boolean flag;
    private boolean click;
    private String mines;
    private int row;
    private int col;
    private int xPos;
    private int yPos;
    private Color safeColor; //color of unclicked safe squares

    public Square(boolean mine, int row, int col) {
        this.mine = mine;
        flag = false;
        click = false;
        this.row = row;
        this.col = col;
        safeColor = new Color(160,160,160);
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
        return col;
    }

    public void changeFlag() {
        flag = !flag;
        if(flag) {
            this.setBackground(Color.RED);
        }
        else {
            this.setBackground(Color.lightGray);
        }
    }

    public void clicked() {
        if(click) return;
        click = true;
        if(mine) GUI.backToStart(); //if a mine is clicked, the game restarts
        else{
            GUI.decrementCount();
            mines = Board.number(this);
            this.setBackground(safeColor); //make the square slightly darker and reveal the number of mines that it is adjacent to
            if(mines.equals("")) Board.reveal(this);             
            else {
                this.setMargin(new Insets(0,0,0,0));
                this.setText(mines);
            }
        }   
    }   
    

    public int getXPos() {
        return xPos;
    }

    public int getYPos() {
        return yPos;
    }

}
