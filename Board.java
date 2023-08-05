import java.awt.Color;
import java.awt.Font;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.util.ArrayList;

import javax.swing.JLabel;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;


public class Board implements MouseListener{
    private int mineCount; //number of mines
    private int tempMineCount; //used across multiple calls of the random method
    private static int rows;
    private static int columns;
    private int squares;
    private static Square[][] field;
    private int flagCount;
    private JLabel flagLabel;

    public Board(int mines, int rows, int columns) {
        mineCount = mines;
        tempMineCount = mineCount;
        flagCount = mines;
        Board.rows = rows;
        Board.columns = columns;
        squares = rows * columns;
        field = new Square[rows][columns];
        flagLabel = new JLabel("Flags: " + flagCount, SwingConstants.CENTER);
        flagLabel.setBounds(200,20,200,40);
        flagLabel.setFont(new Font("SansSerif", Font.PLAIN, 30));
        GUI.addToGamePanel(flagLabel);

        int x = 50;
        int y = 50;

        for(int i=0; i < field.length; i++) {
            y += 51;
            x = 50;
            for(int j=0; j<field[0].length; j++) {
                x += 51;
                field[i][j] = new Square(random(), i, j);
                field[i][j].setBounds(x,y,50,50);
                field[i][j].setBackground(Color.lightGray);
                field[i][j].setOpaque(true);
                field[i][j].setBorderPainted(false);
                field[i][j].addMouseListener(this);
                GUI.addToGamePanel(field[i][j]);
            }
        }

        //finds one square with no adjacent mines to reveal at least 9 squares to help the player start, makes the square green
        ArrayList<Square> zeros = new ArrayList<>();
        for(Square[] row : field) {
            for(Square s : row) {
                if(number(s).equals("")) zeros.add(s);
            }
        }
        Square temp = zeros.get((int)(Math.random()*zeros.size()));
        temp.setBackground(new Color(0,200,0));

        

    }

    //determines whether or not an undecided square should or should not be a mine during the setup of the board
    public boolean random() {
        int x = (int)(Math.random()*squares);
        if(x < tempMineCount) {
            tempMineCount--;
            squares--;
            return true;
        }
        squares--;
        return false;
    }

    public int getSquares() {
        return squares;
    }

    public int getMines() {
        return mineCount;
    }

    public int getRows() {
        return rows;
    }

    public int getColumns() {
        return columns;
    }

    //returns the number of mines adjacent to a square as a string to be displayed on the square once it is clicked
    public static String number(Square square) {
        int mines = 0;
        int i = square.getRow()-1 < 0 ? square.getRow() : square.getRow()-1;
        int j = square.getCol()-1 < 0 ? square.getCol() : square.getCol()-1;
        if(i < 0) i++;
        if(j < 0) j++;
        while(i < rows && i <= square.getRow()+1) {
            while(j < columns && j <= square.getCol()+1) {
                if(field[i][j].isMine()) mines++;
                j++;
            }
            j = square.getCol()-1 < 0 ? square.getCol() : square.getCol()-1;
            i++;
        }
        if(mines == 0) return "";
        return "" + mines;
    }

    //automatically "clicks" all adjacent squares when the square has no mines around it
    public static void reveal(Square square) {
        int i = square.getRow()-1 < 0 ? square.getRow() : square.getRow()-1;
        int j = square.getCol()-1 < 0 ? square.getCol() : square.getCol()-1;
        if(i < 0) i++;
        if(j < 0) j++;
        while(i < rows && i <= square.getRow()+1) {
            while(j < columns && j <= square.getCol()+1) {
                if(!field[i][j].equals(square) && !field[i][j].isClick()) {
                    field[i][j].clicked();
                }
                j++;
            }
            j = square.getCol()-1 < 0 ? square.getCol() : square.getCol()-1;
            i++;
        }
    }

    @Override
    public void mouseClicked(MouseEvent e) {
        if(SwingUtilities.isRightMouseButton(e) && !((Square) e.getSource()).isClick()) {
            Square square = (Square) e.getSource();
            square.changeFlag();
            if(square.isFlag()) flagCount--;
            else flagCount++;
            flagLabel.setText("Flags: " + flagCount);
        }
        else {
            Square square = (Square) e.getSource();
            if(!square.isFlag()) square.clicked();
        }
        return;
    }

    @Override
    public void mousePressed(MouseEvent e) {
        return;
    }

    @Override
    public void mouseReleased(MouseEvent e) {
        return;
    }

    @Override
    public void mouseEntered(MouseEvent e) {
        return;
    }

    @Override
    public void mouseExited(MouseEvent e) {
        return;
    }
}