// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../../../components/misc/Link';

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
      <Typography component="h1" variant="h3" gutterBottom>
        Erste Schritte
      </Typography>
      <Typography variant="body1" paragraph>
        Die hedgehog IDE ermöglicht es dir, einfach eigene Programme zu
        schreiben und auszuführen, ohne vorher zusätzliche Software installieren
        oder ein Konto erstellen zu müssen. Wir legen großen Wert auf
        Privatsphäre und Datenschutz, deshalb fragen wir dich nach keinen Daten
        die wir nicht unbedingt benötigen. Im Großen und Ganzen heißt das, außer
        deinem Code musst du uns keine Daten geben.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Alert severity="info">
          Die Hedgehog IDE befindet sich noch im Anfangsstadium. Manche
          Funktionen sind vielleicht noch nicht ganz ausgereift oder fehlen
          noch. Zukünftige Features, wie etwa eigenen Code mit anderen zu
          teilen, können zusätzliche Daten von dir benötigen. Solche Features
          werden jedenfalls opt-in sein, das heißt du entscheidest ob du diese
          nutzt und uns die notwendigen Daten gibst.
        </Alert>
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Ein Projekt anlegen
      </Typography>
      <Typography variant="body1" paragraph>
        Ein Softwareprojekt enthält Dateien, die zusammen ein Programm ergeben.
        Ein Projekt anzulegen ist deshalb der erste Schritt. Klicke in deiner{' '}
        <Link to="/projects">Projektübersicht</Link>, auf den
        &quot;+&quot;-Button und such dir einen Namen aus. Klicke danach auf das
        Projekt um es zu öffnen.
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
        Nachdem du das Projekt geöffnet hast, mach einen Rechtsklick auf den
        Projektordner, um darin eine Datei anzulegen. In diesem Beispiel wählen
        wir &quot;Neue Blockly Datei&quot; &ndash; mit Blockly kannst du dein
        Programm grafisch erstellen. Nachdem du die Datei benannt hast, musst du
        wahrscheinlich auf das kleine &quot;+&quot; beim Projektordner drücken
        um die Datei anzuzeigen. Öffne dann die Datei mit einem Doppelklick,
        dann solltest du einen leeren Blockly-Arbeitsbereich sehen.
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
      <Typography component="h2" variant="h4" gutterBottom>
        Einen simulierten Roboter mit Blockly steuern
      </Typography>
      <Typography variant="body1" paragraph>
        Bevor du beginnst Blöcke zu deinem Programm hinzuzufügen, machen wir
        schnell einen Blick auf den Simulator. Klicke über dem Projektordner auf
        das Symbol mit den X,Y,Z Achsen um ihn zu öffnen, dann ziehe den neu
        geöffneten Tab zur Seite, damit Blockly und der Simulator gleichzeitig
        sichtbar sind.
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
        Der Simulator (und übrigens auch die Konsole, die mit dem zweiten Button
        über dem Projektordner geöffnet wird) öffnen sich automatisch, wenn ein
        Befehl an den Roboter gegeben (oder eben Text ausgegeben) werden soll.
      </Typography>
      <Typography variant="body1" paragraph>
        Die Blockly-Befehle sind in mehrere Kategorien eingeteilt:
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <ul>
          <li>
            Die Kategorie <strong>Fahren</strong> enthält Befehle, um immer zwei
            Motoren gleichzeitig zu steuern. Dadurch können beide Räder des
            Roboters zeitgleich gestartet oder angehalten werden. Die
            Geschwindigkeit der Motoren wird als Zahl zwischen -1000 und +1000
            angegeben. Der Simulierte Roboter hat sein linkes Rad an Motor 0,
            sein rechtes an Motor 1.
          </li>
          <li>
            In der <strong>Motoren</strong>-Kategorie sind Befehle, um Motoren
            einzeln anzusteuern.
          </li>
          <li>
            <strong>Servos</strong> können auf Positionen eingestellt werden,
            die zwischen 0 und 1000 angegeben werden. Der simulierte Roboter hat
            momentan noch keine Servos.
          </li>
          <li>
            Mit <strong>Sensoren</strong> kann der Roboter seine Umgebung
            wahrnehmen. Sensorwerte sind zwischen 0 und 4095. Vorne hat der
            simulierte Roboter fünf Sensoren:
            <ul>
              <li>
                Vier Liniensensoren, die die schwarzen Linien auf dem Boden
                erkennen können. Das sind von links nach rechts die Sensoren 0
                bis 3. Wenn eine Linie erkannt wird, ist der Sensorwert hoch.
              </li>
              <li>
                Ein Stoßsensor, der fast so breit ist wie der Roboter selbst,
                befindet sich vorne am Roboter. Dieser Sensor hat die Nummer 8.
                Der Wert ist niedrig, wenn eine Kollision erkannt wird.
              </li>
            </ul>
          </li>
          <li>
            Die anderen Kategorien enthalten generelle Programmierwerkzeuge,
            etwa Unterscheidungen und Schleifen.
          </li>
        </ul>
      </Typography>
      <Typography variant="body1" paragraph>
        Probieren wir jetzt ein simples Programm:
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Grid container spacing={1}>
          <Grid item xs={12} className={`${s.gridImg} ${s.gridImgLg}`}>
            <img src={help4img1} alt="Beispielprogramm" />
          </Grid>
        </Grid>
      </Typography>
      <Typography variant="body1" paragraph>
        Erstelle dieses Programm in deinem Projekt, dann klicke auf den grünen
        Pfeil. Du wirst sehen, wie der Roboter bis zur nächsten Wand fährt und
        dort nach der Kollision stehenbleibt. Schritt für Schritt ist folgendes
        passiert:
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <ul>
          <li>Der erste Block lässt den Roboter vorwärts losfahren.</li>
          <li>
            Der nächste Block ist eine Schleife, die aufgeführt wird solange der
            Sensor 8 einen hohen Digitalwert hat. Anders ausgedrückt, die
            Schleife wird wiederholt, solange der Sensor keinen Zusammenstoß
            erkennt.
          </li>
          <li>
            In der Schleife wird das Programm kurz unterbrochen. Auch wenn das
            Programm eine Pause macht bewegen sich die Motoren weiter, das heißt
            der Roboter fährt bis der Sensor die Schleife zum Abbruch bringt.
          </li>
          <li>
            Nach der Schleife, also nach einer Kollision, bleibt der Roboter
            stehen. Da das der letzte Befehl ist endet die Schleife danach.
          </li>
        </ul>
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Dateien exportieren & importieren
      </Typography>
      <Typography variant="body1" paragraph>
        Willst du eine deiner Dateien herunterzuladen, z.B. um diese mit anderen
        zu teilen, Mach einen Rechtsklick auf diese Datei und wähle
        &quot;Herunterladen&quot;. Ähnlich kannst du Dateien in die IDE
        importieren, indem du auf einen Ordner rechtsklickst umd
        &quot;Hochladen&quot; wählst. Achtung, momentan werden dadurch
        bestehende Dateien ohne Warnung überschrieben!
      </Typography>
      <Typography variant="body1" paragraph>
        Trotz der Namen dieser Befehle werden deine Dateien nicht auf unseren
        Servern gespeichert, sondern lokal in deinem Browser wo nur du Zugriff
        darauf hast. In der Zukunft wird es auch die Möglichkeit geben, Projekte
        auf unseren Servern zu speichern, du wirst aber immer gefragt werden, ob
        du deine Daten mit uns teilen willst.
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
    </Container>
  );
}

export default withStyles(s)(Help);
