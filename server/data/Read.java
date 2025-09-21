import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class Read {
    public static void main(String[] args) {
        if (args == null || args.length == 0 || args[0].isEmpty())
            System.exit(0);
        File readFile = new File(new File("").getAbsolutePath() + "/server/data/data.txt");
        File outputFile = new File(new File("").getAbsolutePath() + "/server/data/output.txt");
        String outputString = null;
        try (Scanner sc = new Scanner(readFile)) {
            while (sc.hasNext()) {
                String line = sc.nextLine();
                if (line.indexOf(args[0]) >= 0) {
                    outputString = line;
                    break;
                }
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        if (outputString == null)
            outputString = "BAD_READ (" + args[0] + ")";
        try (FileWriter writer = new FileWriter(outputFile)) {
            writer.write(outputString + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
