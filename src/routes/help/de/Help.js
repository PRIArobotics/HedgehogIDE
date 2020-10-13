// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../../../components/misc/Link';
import ReadOnlyBlockly from '../../../components/ide/ReadOnlyBlockly';

import Blockly, {
  hedgehogBlocks,
  miscBlocks,
} from '../../../components/ide/VisualEditor/blockly_config.js';

import s from '../Help.scss';

import help1img1 from '../en/1_create_project/1_open_ide.png';
import help1img2 from '../en/1_create_project/2_click_plus.png';
import help1img3 from '../en/1_create_project/3_create_project.png';
import help1img4 from '../en/1_create_project/4_open_project.png';
import help2img1 from '../en/2_create_file/1_context_menu.png';
import help2img2 from '../en/2_create_file/2_create_file.png';
import help2img3 from '../en/2_create_file/3_open_file.png';
import help3img1 from '../en/3_open_simulator/1_drag_tab.png';
import help3img2 from '../en/3_open_simulator/2_result.png';
import help4img1 from '../en/4_blockly_example/1_example_program.png';
import help5img1 from '../en/5_import_export/1_export.png';
import help5img2 from '../en/5_import_export/2_import.png';

function Help() {
  return (
    <Container maxWidth="md" className={s.root}>
      <>
        <Typography component="h1" variant="h3" gutterBottom>
          Erste Schritte
        </Typography>
        <Typography variant="body1" paragraph>
          Die Hedgehog IDE ermöglicht es dir, einfach eigene Programme zu schreiben und auszuführen,
          ohne vorher zusätzliche Software installieren oder ein Konto erstellen zu müssen. Wir legen
          großen Wert auf Privatsphäre und Datenschutz, deshalb fragen wir dich nach keinen Daten die
          wir nicht unbedingt benötigen. Im Großen und Ganzen heißt das, außer deinem Code musst du
          uns keine Daten geben.
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <Alert severity="info">
            Die Hedgehog IDE befindet sich noch im Anfangsstadium. Manche Funktionen sind vielleicht
            noch nicht ganz ausgereift oder fehlen noch. Zukünftige Features, wie etwa eigenen Code
            mit anderen zu teilen, können zusätzliche Daten von dir benötigen. Solche Features werden
            jedenfalls opt-in sein, das heißt du entscheidest ob du diese nutzt und uns die
            notwendigen Daten gibst.
          </Alert>
        </Typography>
      </>
      <>
        <Typography component="h2" variant="h4" gutterBottom>
          Ein Projekt anlegen
        </Typography>
        <Typography variant="body1" paragraph>
          Ein Softwareprojekt enthält Dateien, die zusammen ein Programm ergeben. Ein Projekt
          anzulegen ist deshalb der erste Schritt. Klicke in deiner{' '}
          <Link to="/">Projektübersicht</Link>, auf den &quot;+&quot;-Button und such dir einen Namen
          aus. Klicke danach auf das Projekt um es zu öffnen.
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <Grid container spacing={1}>
            <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help1img1} alt="die IDE öffne" />
            </Grid>
            <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help1img2} alt='auf den "+"-Button klicken' />
            </Grid>
            <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help1img3} alt="Projekt benennen und anlegen" />
            </Grid>
            <Grid item xs={6} md={3} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help1img4} alt="Projekt öffnen" />
            </Grid>
          </Grid>
        </Typography>
        <Typography variant="body1" paragraph>
          Nachdem du das Projekt geöffnet hast, mach einen Rechtsklick auf den Projektordner, um darin
          eine Datei anzulegen. In diesem Beispiel wählen wir &quot;Neue Blockly Datei&quot; &ndash;
          mit Blockly kannst du dein Programm grafisch erstellen. Nachdem du die Datei angelegt hast,
          wird diese automatisch geöffnet, du solltest also den leeren Blockly-Arbeitsbereich sehen.
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <Grid container spacing={1}>
            <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help2img1} alt="Kontextmenu" />
            </Grid>
            <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help2img2} alt="Datei anlegen" />
            </Grid>
            <Grid item xs={6} sm={4} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help2img3} alt="Datei öffnen" />
            </Grid>
          </Grid>
        </Typography>
      </>
      <>
        <Typography component="h2" variant="h4" gutterBottom>
          Einen simulierten Roboter mit Blockly steuern
        </Typography>
        <Typography variant="body1" paragraph>
          Bevor du beginnst Blöcke zu deinem Programm hinzuzufügen, machen wir schnell einen Blick auf
          den Simulator. Klicke über dem Projektordner auf das Symbol mit den X,Y,Z Achsen um ihn zu
          öffnen, dann ziehe den neu geöffneten Tab nach unten, damit Blockly und der Simulator
          gleichzeitig sichtbar sind.
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <Grid container spacing={1}>
            <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgLg}`}>
              <img src={help3img1} alt="den Simulator verschieben" />
            </Grid>
            <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgLg}`}>
              <img src={help3img2} alt="Blockly und Simulator nebeneinander" />
            </Grid>
          </Grid>
        </Typography>
        <Typography variant="body1" paragraph>
          Der Simulator (und übrigens auch die Konsole, die mit dem zweiten Button über dem
          Projektordner geöffnet wird) öffnen sich automatisch, wenn ein Befehl an den Roboter gegeben
          (oder eben Text ausgegeben) werden soll. Es ist aber trotzdem praktischer, diese Tabs vorher
          selbst zu platzieren.
        </Typography>
      </>
      <>
        <Typography component="h2" variant="h4" gutterBottom>
          Die Blockly-Befehle
        </Typography>
        <>
          <Typography component="h3" variant="h5" gutterBottom>
            Fahren
          </Typography>
          <Typography variant="body1" paragraph>
              Diese Kategorie enthält Befehle, um immer zwei Motoren gleichzeitig zu steuern. Dadurch
              können beide Räder des Roboters zeitgleich gestartet oder angehalten werden. Die
              Geschwindigkeit der Motoren wird als Zahl zwischen -1000 und +1000 angegeben. Der
              Simulierte Roboter hat sein linkes Rad an Motor 0, sein rechtes an Motor 1.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_MOVE2_UNLIMITED.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_MOVE2.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Diese Befehle starten die Motoren. Bei der zweiten Variante wird der Roboter nach einer
            gewissen Zeit wieder abgebremst.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_MOTOR_OFF2.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_BRAKE2.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Diese Befehle stoppen die Motoren. Momentan machen beide Befehle in der Simulation das
            gleiche, aber die Idee ist, dass der Roboter bei Ausschalten weiter ausrollt, beim Bremsen
            schnell stehenbleibt.
          </Typography>
        </>
        <>
          <Typography component="h3" variant="h5" gutterBottom>
            Motoren
          </Typography>
          <Typography variant="body1" paragraph>
            In dieser Kategorie sind Befehle, um Motoren einzeln anzusteuern. Die Befehle
            funktionieren sonst genau so wie die Fahrbefehle.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_MOVE_UNLIMITED.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_MOVE.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Diese Befehle starten einen Motor. Bei der zweiten Variante wird der Motor nach einer
            gewissen Zeit wieder abgebremst.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_MOTOR_OFF.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_BRAKE.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Diese Befehle stoppen einen Motor. Momentan machen beide Befehle in der Simulation das
            gleiche, aber die Idee ist, dass der Motor bei Ausschalten weiter ausrollt, beim Bremsen
            schnell stehenbleibt.
          </Typography>
        </>
        <>
          <Typography component="h3" variant="h5" gutterBottom>
            Servos
          </Typography>
          <Typography variant="body1" paragraph>
            Servos können auf Positionen eingestellt werden, die zwischen 0 und 1000 bzw. zwischen
            0° und 180° angegeben werden. Der simulierte Roboter hat momentan noch keine Servos.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_SERVO.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Dieser Befehl stellt den Servo auf eine Position ein. Auch bei Widerstand (z.B. einem
            Hindernis) versucht der Servo den eingestellten Winkel zu halten.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_SERVO_OFF.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Dieser Befehl schaltet den Servo aus. Der Servo wird seine Position bei Widerstand nicht
            halten.
          </Typography>
        </>
        <>
          <Typography component="h3" variant="h5" gutterBottom>
            Sensoren
          </Typography>
          <Typography variant="body1" paragraph>
              Mit Sensoren kann der Roboter seine Umgebung wahrnehmen. Sensorwerte liegen zwischen
              0 und 4095, die genauen Wertebereiche hängen aber von der Art des Sensors ab.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            Vorne hat der simulierte Roboter acht Sensoren:
            <ul>
              <li>
                Vier Liniensensoren, die schwarze Linien auf dem Boden erkennen können. Das sind von
                links nach rechts die Sensoren 0 bis 3. Die Sensoren werden orange dargestellt, wenn
                eine Linie erkannt wird.
                <br />
                <strong>Werte:</strong> Wenn eine (dunkle) Linie unter dem Sensor erkannt wird, ist
                der Sensorwert hoch, sonst (auf heller Oberfläche) niedrig.
              </li>
              <li>
                Drei Abstandssensoren, die seitlich und direkt nach vorne gerichtet sind und mit
                denen Hindernissen ohne Berührung erkannt werden können. Das sind von links nach
                rechts die Sensoren 4 bis 6. Die Strahlen vor dem Roboter stellen die Richtung und
                Reichweite der Abstandssensoren dar.
                <br />
                <strong>Werte:</strong> Wenn ein Hindernis näher kommt steigt der Wert zuerst an,
                wenn es den Roboter fast berührt sinkt er wieder. Dieses Verhalten bildet einen
                häufig verwendeten Abstandssensor aus der Hobby-Robotik nach.
              </li>
              <li>
                Ein Stoßsensor, der fast so breit ist wie der Roboter selbst, befindet sich vorne am
                Roboter. Dieser Sensor hat die Nummer 8. Er wird orange dargestellt, wenn eine
                Kollision erkannt wird.
                <br />
                <strong>Werte:</strong> Der Wert ist niedrig, wenn eine Kollision erkannt wird.
                Dieses Verhalten bildet die elektronische &quot;pull-up&quot; Schaltung für
                Tastsensoren nach.
              </li>
            </ul>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            Sensoren gibt es in zwei Arten, analog und digital:
            <ul>
              <li>
                <strong>Analoge</strong> Sensoren können viele verschiedene Werte Annehmen; der
                Abstandssensor ist dafür ein gutes Beispiel. Um einen Analogsensor zu benutzen,
                musst du mit den Werten zwischen 0 und 4095 arbeiten.
              </li>
              <li>
                <strong>Digitale</strong> Sensoren haben nur zwei mögliche Zustände, zum Beispiel
                &quot;Zusammenstoß&quot; und &quot;kein Zusammenstoß&quot; oder &quot;Linie
                erkannt&quot; und &quot;keine Linie erkannt&quot;. Bei diesen Sensoren kann man auch
                den entsprechenden Digitalwert abfragen:
                <ul>
                  <li>
                    Analogwerte 0 bis 2047: Digitalwert <code>false</code>, &quot;falsch&quot;
                  </li>
                  <li>
                    Analogwerte 2048 bis 4095: Digitalwert <code>true</code>, &quot;wahr&quot;
                  </li>
                </ul>
              </li>
            </ul>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_READ_DIGITAL.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Liest den digitalen Wert eines Sensors aus.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="50px">
              {hedgehogBlocks.HEDGEHOG_READ_ANALOG.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_READ_ANALOG.toolboxBlocks.comparison()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Liest den analogen Wert eines Sensors aus. Das untere Beispiel vergleicht den Wert mit
            einem Grenzwert, um daraus einen (digitalen) Wahrheitswert (wahr/falsch) zu machen. Der
            Grenzwert 2048 verhält sich genau gleich wie der obere Block zum auslesen des
            Digitalwerts. Mit dem Vergleichsblock kann der Grenzwert aber angepasst werden.
          </Typography>
        </>
        <>
          <Typography component="h3" variant="h5" gutterBottom>
            Verschiedenes
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {hedgehogBlocks.HEDGEHOG_SLEEP.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Dieser Befehl unterbricht das Programm für eine gewisse Zeit. Wenn währenddessen ein
            Motor eingeschalten ist, wird sich dieser weiterdrehen.
          </Typography>
          <Typography variant="body1" component="div" paragraph>
            <ReadOnlyBlockly width="100%" height="60px">
              {miscBlocks.PRINT_BLOCK.toolboxBlocks.default()}
            </ReadOnlyBlockly>
          </Typography>
          <Typography variant="body1" paragraph>
            Dieser Befehl gibt einen Wert auf der Konsole aus. Der Wert kann ein Text sein, oder
            eine Zahl oder ein digitaler Wahrheitswert. Oft hilft es, sich den Wert eines Sensors
            anzeigen zu lassen, wenn ein Programm nicht tut was man will.
          </Typography>
        </>
      </>
      <>
        <Typography variant="body1" paragraph>
          Probieren wir jetzt ein simples Programm:
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <ReadOnlyBlockly width="100%" height="160px">
            <block type="hedgehog_move2_unlimited">
              <field name="PORT1">0</field>
              <field name="PORT2">1</field>
              <value name="SPEED1">
                <shadow type="math_number">
                  <field name="NUM">1000</field>
                </shadow>
              </value>
              <value name="SPEED2">
                <shadow type="math_number">
                  <field name="NUM">1000</field>
                </shadow>
              </value>
              <next>
                <block type="controls_whileUntil">
                  <field name="MODE">WHILE</field>
                  <value name="BOOL">
                    <block type="hedgehog_read_digital">
                      <field name="PORT">8</field>
                    </block>
                  </value>
                  <statement name="DO">
                    <block type="hedgehog_sleep">
                      <value name="TIME">
                        <shadow type="math_number">
                          <field name="NUM">0.01</field>
                        </shadow>
                      </value>
                    </block>
                  </statement>
                  <next>
                    <block type="hedgehog_brake2">
                      <field name="PORT1">0</field>
                      <field name="PORT2">1</field>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </ReadOnlyBlockly>
        </Typography>
        <Typography variant="body1" paragraph>
          Erstelle dieses Programm in deinem Projekt, dann klicke auf den grünen Pfeil. Du wirst
          sehen, wie der Roboter bis zur nächsten Wand fährt und dort nach der Kollision stehenbleibt.
          Schritt für Schritt ist folgendes passiert:
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <ul>
            <li>Der erste Block lässt den Roboter vorwärts losfahren.</li>
            <li>
              Der nächste Block ist eine Schleife, die aufgeführt wird solange der Sensor 8 einen
              hohen Digitalwert hat. Sensor 8 ist ein Stoßsensor, und ein hoher Wert bedeutet keine
              Kollision. Anders ausgedrückt, die Schleife wird wiederholt, solange der Sensor keinen
              Zusammenstoß erkennt.
            </li>
            <li>
              In der Schleife wird das Programm kurz unterbrochen. Auch wenn das Programm eine Pause
              macht bewegen sich die Motoren weiter, das heißt der Roboter fährt bis der Sensor die
              Schleife zum Abbruch bringt.
            </li>
            <li>
              Nach der Schleife, also nach einer Kollision, bleibt der Roboter stehen. Da das der
              letzte Befehl ist endet das Programm danach.
            </li>
          </ul>
        </Typography>
      </>
      <>
        <Typography component="h2" variant="h4" gutterBottom>
          Dateien exportieren & importieren
        </Typography>
        <Typography variant="body1" paragraph>
          Willst du eine deiner Dateien herunterzuladen, z.B. um diese mit anderen zu teilen, mach
          einen Rechtsklick auf diese Datei und wähle &quot;Herunterladen&quot;. Ähnlich kannst du
          Dateien in die IDE importieren, indem du auf einen Ordner rechtsklickst umd
          &quot;Hochladen&quot; wählst. Achtung, momentan werden dadurch bestehende Dateien ohne
          Warnung überschrieben!
        </Typography>
        <Typography variant="body1" paragraph>
          Trotz der Namen dieser Befehle werden deine Dateien nicht auf unseren Servern gespeichert,
          sondern lokal in deinem Browser wo nur du Zugriff darauf hast. In der Zukunft wird es auch
          die Möglichkeit geben, Projekte auf unseren Servern zu speichern, du wirst aber immer
          gefragt werden, ob du deine Daten mit uns teilen willst.
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <Alert severity="info">
            Ganze Ordner hoch- oder herunterzuladen ist leider noch nicht möglich.
          </Alert>
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          <Grid container spacing={1}>
            <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help5img1} alt="eine Datei herunterladen" />
            </Grid>
            <Grid item sm={12} md={6} className={`${s.gridImg} ${s.gridImgSm}`}>
              <img src={help5img2} alt="eine Datei hochladen" />
            </Grid>
          </Grid>
        </Typography>
      </>
    </Container>
  );
}

export default withStyles(s)(Help);
