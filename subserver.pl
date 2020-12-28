#!/usr/bin/env perl
# directions:   on fi /usr/local/bin/subserver.pl (server port 8081 and vlc on 8082) 
$HELP1="Easiest to invoke this from same directory that files reside.  open browser to http://fi:8081/subs.html";
$HELP2="invoke vlc with subvlc alias on linux (linux: /usr/bin/vlc --http-host=127.0.0.1 --http-port=8080)\n on windows cd \program files (x86))\VIdeoLAN/VLC and invoke:  vlc.exe --http-host=127.0.0.1 --http-port=8080 ";


use LWP;
use LWP::UserAgent;
use Socket;
use IO::Socket;

my $port = 8081;  #  shift;


# choose where VLC is running
#$VLC='http://127.0.0.1:8082';    # fi
$VLC='http://192.168.1.22:8080';  # laptop
$VLC='http://10.0.0.235:8080';  # laptop at Argen
$VLC='http://127.0.0.1:8080';  # laptop at Argen
 

$USER = '';
$PASS = 'f';
$SHOWFILES=0;

$DOCUMENT_ROOT = ".";
#$DOCUMENT_ROOT = "/var/www/html";






my $ua = LWP::UserAgent->new();

sub parse_form {
    my $data = $_[0];
    my %data;
    foreach (split /&/, $data) {
        my ($key, $val) = split /=/;
        $val =~ s/\+/ /g;
        $val =~ s/%(..)/chr(hex($1))/eg;
        $data{$key} = $val;
    }
    return %data; 
}

sub vlcpause {
    my $request = HTTP::Request->new(GET => "$VLC/requests/status.xml?command=pl_pause");
    $request->authorization_basic($USER, $PASS);
    my $response = $ua->request($request);
    my $content = $response->content();
}

sub vlcseek {
    ($ms) = $_[0]/1000;
    ($ms) = split(/\./, $ms);
    my $request = HTTP::Request->new(GET => "$VLC/requests/status.xml?command=seek&val=$ms");
    $request->authorization_basic($USER, $PASS);
    my $response = $ua->request($request);
}


# Setup and create socket
defined($port) or die "Usage: $0 portno\n";

my $server = new IO::Socket::INET(Proto => 'tcp',
                                  LocalPort => $port,
                                  Listen => SOMAXCONN,
                                  Reuse => 1);
$server or die "Unable to create server socket: $!" ;

my $VLCsocket = new IO::Socket::INET(Proto => 'tcp',
                                  LocalPort => 8080,
                                  Listen => SOMAXCONN,
                                  Reuse => 1);
$VLCsocket or die "Unable to create vlc socket: $!" ;


# Await requests and handle them as they arrive

print "VLC command server is running on port $port for vlc on $VLC...\n";
print "$HELP1\n";
print "$HELP2\n";
while (my $client = $server->accept()) {
    binmode $client;
    $client->autoflush(1);
    my %request = ();
    my %data;

    {

#-------- Read Request ---------------

        local $/ = Socket::CRLF;
        while (<$client>) {
            chomp; # Main http request
            if (/\s*(\w+)\s*([^\s]+)\s*HTTP\/(\d.\d)/) {
                $request{METHOD} = uc $1;
                $request{URL} = $2;
                $request{HTTP_VERSION} = $3;
            } # Standard headers
            elsif (/:/) {
                (my $type, my $val) = split /:/, $_, 2;
                $type =~ s/^\s+//;
                foreach ($type, $val) {
                        s/^\s+//;
                        s/\s+$//;
                }
                $request{lc $type} = $val;
            } # POST data
            elsif (/^$/) {
                read($client, $request{CONTENT}, $request{'content-length'})
                    if defined $request{'content-length'};
                last;
            }
        }
    }

#-------- SORT OUT METHOD  ---------------

#print ("kwrr1 method=>" . $request{METHOD} . "< ====>" . $request{CONTENT} . "<\n");


    if ($request{METHOD} eq 'GET') {
        if ($request{URL} =~ /(.*)\?(.*)/) {
                $request{URL} = $1;
                $request{CONTENT} = $2;
                %data = parse_form($request{CONTENT});
        } else {
                %data = ();
        }
        $data{"_method"} = "GET";
    } elsif ($request{METHOD} eq 'POST') {
                %data = parse_form($request{CONTENT});
                $data{"_method"} = "POST";
    } else {
        $data{"_method"} = "ERROR";
    }

#------- Serve file ----------------------

        #print ("kwrr2 req=>" . $request{URL} . "<\n");

        if ($request{URL} =~ /vlcpause/) {
            print "processing vlc pause:  $request{URL}\n";

            &vlcpause();
            print $client "HTTP/1.0 200 OK", Socket::CRLF;
            #print $client "Content-type: text/html", Socket::CRLF;
        
        } elsif ($request{URL} =~ /vlcseek/) {
            print "processing vlc seek for $request{CONTENT}\n";
            #($command, $param) = split(/\?/, $request{URL});
            &vlcseek($request{CONTENT});
            print $client "HTTP/1.0 200 OK", Socket::CRLF;
        } elsif ($request{URL} =~ /getdir/) {
            print "processing getdir\n";
            print $client "HTTP/1.0 200 OK", Socket::CRLF;

            $dirlist='';
            (@files) = glob "$DOCUMENT_ROOT/*.srt";
            for $fname (@files) {
              @arr = split /\//, $fname ;  # trim path from basename
              #$dirlist .= "$fname,";
              $dirlist .= "$arr[$#arr],";
            }  
            chop $dirlist;

            print $client "Content-type: text/plain", Socket::CRLF;
            print $client Socket::CRLF;
            my $buffer;
            print $client $dirlist;
            $data{"_status"} = "200";
            print "processed getdir\n";
        
        } else {
            $request{URL} = '/index.html' if $request{URL} eq "/";
            print "Serving $request{URL}";

            #http://127.0.0.1:8081/requests/status.xml?command=pl_pause

#            my $localfile = $DOCUMENT_ROOT.$request{URL};
            my $localfile = "$DOCUMENT_ROOT" . "$request{URL}";

    # Send Response
            if (open(FILE, "<$localfile")) {
                binmode FILE;
                @arr = (split /\./, $localfile);
                $extension = "$arr[$#arr]";   #   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
                if ($extension eq 'css') {
                  $mimetype = 'text/css';
                } elsif ($extension eq 'htm' || $extension eq 'html') {
                  $mimetype = 'text/html';
                } elsif ($extension eq 'js' ) {
                  $mimetype = 'text/javascript';
                } elsif ($extension eq 'png' ) {
                  $mimetype = 'image/png';
                } else {
                  $mimetype = 'text/plain';
                }  

                print "\n!!!!ext=>$extension< mimetype=>$mimetype< \n";

                print "...$localfile\n";
                print $client "HTTP/1.0 200 OK", Socket::CRLF;
                print $client "Content-type: $mimetype", Socket::CRLF;
                print $client Socket::CRLF;
                my $buffer;
                while (read(FILE, $buffer, 4096)) {
                    print $client $buffer;
                }
                $data{"_status"} = "200";
            }
            else {
                print "...ERROR: $localfile not found\n";
                print $client "HTTP/1.0 404 Not Found", Socket::CRLF;
                print $client Socket::CRLF;
                print $client "<html><body>404 Not Found</body></html>";
                $data{"_status"} = "404";
            }
            close(FILE);

    # Log Request
            if ($SHOWFILES) {
                print ($DOCUMENT_ROOT.$request{URL},"\n");
                foreach (keys(%data)) {
                    print ("   $_ = $data{$_}\n"); }
                }
            }

# ----------- Close Connection and loop ------------------

    close $client;
}

