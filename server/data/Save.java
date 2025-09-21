import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class Save {
    public static void main(String[] args) {
        File file = new File(new File("").getAbsolutePath() + "/server/data/data.txt");
        try (FileWriter fileWriter = new FileWriter(file, true)) {
            if (args.length != 0)
                fileWriter.write(args[0] + "\n");
            else
                fileWriter.write("Nope\n");
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.exit(-1);
        }
    }
}