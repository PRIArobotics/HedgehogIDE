// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Alert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import s from './Contest.scss';

function Contest() {
  return (
    <Container maxWidth="md" className={s.root}>
      <Typography component="h1" variant="h3" gutterBottom>
        Robotics Day 2020 Modellierungswettbewerb
      </Typography>
      <Typography variant="body1" paragraph>
        Im Rahmen des Robotics Day 2020 findet ein Modellierungs-Wettbewerb
        statt. Im Vorfeld wird ein simulierter Roboter hier in der Hedgehog-IDE
        gesteuert, um in zwei verschiedenen Szenarien Aufgaben zu erfüllen.
        Dabei ist die visuelle Programmierumgebung Blockly zu benutzen, die den
        Programmcode vom Ausführungstarget abstrahiert: zunächst ein
        simulierter, am Robotics Day ein echter Roboter.
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <Alert severity="info">
          Die Lösungen für beide Aufgaben können bis 17. Februar per Email an
          modellierung@roboticsday.at eingeschickt werden. Fragen gehen
          ebenfalls an diese Adresse. Die Hedgehog IDE befindet sich noch in
          Entwicklung, wir bitten deshalb kleinere Fehler zu verzeihen.
        </Alert>
      </Typography>
      <Typography variant="body1" paragraph>
        Am Robotics Day werden die Lösungen auf echten Robotern getestet. Eine
        Fachjury bestehend aus Experten von SparxSystems und PRIA bewertet
        sowohl das Abschneiden der Modelle am echten Roboter, als auch die
        Struktur der Modelle.
      </Typography>
      <Typography variant="body1" paragraph>
        Als Hauptpreis lockt ein Hedgehog Roboter-Controller im Wert von €250!
        Um den Hauptpreis zu gewinnen ist Anwesenheit am Robotics Day notwendig,
        wir freuen uns aber auch über reine Online-Teilnahmen.
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Aufgabe 1 &ndash; Irrgarten
      </Typography>
      <Typography variant="body1" paragraph>
        Ein einfach zusammenhängender Irrgarten kann mit der{' '}
        <a href="https://de.wikipedia.org/wiki/L%C3%B6sungsalgorithmen_f%C3%BCr_Irrg%C3%A4rten#Rechte-Hand-Methode">
          Rechte-Hand-Methode
        </a>{' '}
        gelöst werden. In Aufgabe 1 ist so ein Irrgarten-Netz in schwarz am
        Boden markiert.
      </Typography>
      <Typography variant="body1" paragraph>
        Entwirf ein Programm, mit dem der Roboter entsprechend der
        Rechte-Hand-Methode endlos durch das Netz navigiert. Im Gegensatz zur
        Skizze auf Wikipedia muss der Roboter dabei alle Kreuzungspunkte und
        Sackgassen erkennen und eine entsprechende Entscheidung treffen. Das
        bedeutet, es ist nicht ausreichend wörtlich genommen das Netz nach
        rechts fahrend zu verfolgen! Der Roboter muss erkennen, dass es mehrere
        Möglichkeiten gibt den Weg fortzusetzen (also eine Kreuzung vorliegt)
        bzw. gar keine (also eine Sackgasse). Danach muss entsprechend der
        Methode der rechtest-mögliche weg eingeschlagen werden.
      </Typography>
      <Typography variant="body1" paragraph>
        Eine Ausgabe o.Ä. ist nicht nötig, es ist aber mit der
        Blockly-Kommentarfunktion zu dokumentieren, wie die Erkennung passiert
        und Entscheidungen vorgenommen werden.
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Aufgabe 2 &ndash; Navigation
      </Typography>
      <Typography variant="body1" paragraph>
        Aufbauend auf der Lösung zur Aufgabe 1 sollte die zweite Aufgabe leicht
        zu lösen sein: finde den Weg von der links oberen zur rechts unteren,
        schräg gegenüber liegenden Ecke. Dort soll das Programm beendet werden
        und der Roboter stehen bleiben.
      </Typography>
      <Typography variant="body1" paragraph>
        Wie in Aufgabe 1 sollen die Entscheidungspunkte im Modell deutlich
        identifizierbar sein. Das bedeutet, dass der Ablauf
      </Typography>
      <Typography variant="body1" component="div" paragraph>
        <ul>
          <li>fahre an der ersten Kreuzung gerade aus,</li>
          <li>biege an der zweiten Kreuzung rechts ab,</li>
          <li>biege an der dritten Kreuzung links ab</li>
        </ul>
      </Typography>
      <Typography variant="body1" paragraph>
        im Modell leicht erkennbar sein müsste. Nutze wieder die
        Blockly-Kommentarfunktion, um wichtige Stellen zu dokumentieren.
      </Typography>
    </Container>
  );
}

export default withStyles(s)(Contest);
