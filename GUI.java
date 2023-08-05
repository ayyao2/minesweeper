import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;


public class GUI extends JFrame implements ActionListener{
    private static JFrame frame;
    private static JPanel startPanel;
    private static JPanel gamePanel;
    private static JPanel winPanel;
    private JButton button; //button on the start panel "Click to Start"
    private JButton button2; //button on the win panel "Play Again"
    private JTextField field1; //number of mines
    private JTextField field2; //number of rows
    private JTextField field3; //number of columns
    private JLabel winLabel;
    private Board board;
    private static int count; //number of safe squares unclicked

    public GUI() {
        frame = new JFrame("Minesweeper");

        gamePanel = new JPanel();
        gamePanel.setLayout(null);
        
        winPanel = new JPanel();
        winPanel.setLayout(null);
        winLabel = new JLabel("You Win!", SwingConstants.CENTER);
        winLabel.setBounds(300,200,150,50);
        winLabel.setFont(new Font("SansSerif", Font.PLAIN, 30));
        winPanel.add(winLabel);
        button2 = new JButton("Play Again");
        button2.setBounds(300,300,150,50);
        button2.addActionListener(this);
        winPanel.add(button2);

        startPanel = new JPanel();
        frame.getContentPane();

        button = new JButton("Click To Start");
        button.setBounds(350,450,300,50);
        startPanel.setLayout(null);
        startPanel.add(button);
        button.addActionListener(this);

        field1 = new JTextField("Number of Mines", 50);
        field2 = new JTextField("Number of Rows", 50);
        field3 = new JTextField("Number of Columns", 50);
        field1.setBounds(350, 200, 300, 40);
        field2.setBounds(350, 250, 300, 40);
        field3.setBounds(350, 300, 300, 40);
        startPanel.add(field1);
        startPanel.add(field2);
        startPanel.add(field3);

        frame.add(startPanel);
        frame.setSize(1000,1000);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        frame.setVisible(true);
    }
    public static void main(String args[]) {
        new GUI();
    }

    public void actionPerformed(ActionEvent e) {
        if(e.getSource() == button) {
            board = new Board(Integer.parseInt(field1.getText()), Integer.parseInt(field2.getText()), Integer.parseInt(field3.getText()));
            count = board.getColumns()*board.getRows() - board.getMines();
            frame.remove(startPanel);
            frame.add(gamePanel);
            frame.revalidate();
            frame.repaint();
        }
        
        else if(e.getSource() == button2) {
            backToStart();
        }
    }

    public static void addToGamePanel(JComponent j) {
        gamePanel.add(j); 
    }

    public static void backToStart() {
        frame.dispose();
        new GUI();
    }

    public static void winScreen() {
        frame.remove(gamePanel);
        frame.add(winPanel);
        frame.revalidate();
        frame.repaint();
    }

    public static void decrementCount() {
        count--;
        if(count == 0) winScreen();
    }

}