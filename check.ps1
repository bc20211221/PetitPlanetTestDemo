# accept path from argv1
$path = $args[0]
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $content -split "`n"
[Console]::WriteLine("Lines: $($lines.Length)")

$stack = New-Object 'System.Collections.Generic.Stack[object]'
$errs = @()
$line = 0
for($i=0; $i -lt $content.Length; $i++){
    $c = $content[$i]
    if($c -eq "`n"){$line++; continue}
    if($c -eq '/' -and $i+1 -lt $content.Length -and $content[$i+1] -eq '/'){
        while($i -lt $content.Length -and $content[$i] -ne "`n"){$i++}
        continue
    }
    if($c -eq '/' -and $i+1 -lt $content.Length -and $content[$i+1] -eq '*'){
        $i+=2
        while($i+1 -lt $content.Length -and -not ($content[$i] -eq '*' -and $content[$i+1] -eq '/')){$i++}
        $i++
        continue
    }
    if($c -eq '"' -or $c -eq "'" -or $c -eq '`'){
        $q = $c; $i++
        while($i -lt $content.Length -and $content[$i] -ne $q){
            if($content[$i] -eq '\'){$i++}
            $i++
        }
        continue
    }
    if('({[' -contains $c){$stack.Push(@($c, $line+1))}
    elseif(')}]' -contains $c){
        if($stack.Count -eq 0){$errs += "line $($line+1): unmatched close $c"}
        else{
            $top = $stack.Pop()
            $expected = switch($c){')'{'('}']'{'['}'}'{'{'}}
            if($top[0] -ne $expected){
                $errs += "line $($line+1): mismatch $($top[0]) (line $($top[1])) with $c"
            }
        }
    }
}
foreach($o in $stack){$errs += "unclosed $($o[0]) at line $($o[1])"}
[Console]::WriteLine("Bracket errors: $($errs.Count)")
$errs | Select-Object -First 30 | ForEach-Object { [Console]::WriteLine($_) }
