$path = "D:\Desktop\策划笔试\方块星球-v2\game.js"
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $content -split "`n"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::WriteLine("Lines: $($lines.Length)")

# 1. 括号配对
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
        if($stack.Count -eq 0){$errs += ("line $($line+1): unmatched close $c")}
        else{
            $top = $stack.Pop()
            $expected = switch($c){')'{'('}']'{'['}'}'{'{'}}
            if($top[0] -ne $expected){
                $errs += ("line $($line+1): mismatch $($top[0]) (line $($top[1])) with $c")
            }
        }
    }
}
foreach($o in $stack){$errs += ("unclosed $($o[0]) at line $($o[1])")}
[Console]::WriteLine("Bracket errors: $($errs.Count)")
$errs | Select-Object -First 30 | ForEach-Object { [Console]::WriteLine($_) }

# 2. 重复 let/const
[Console]::WriteLine("`n--- 重复声明 ---")
$decls = @{}
$letRe = [regex]'^\s*(let|const)\s+(.+?)\s*[=;]'
$idx = 0
foreach($ln in $lines){
    $idx++
    if($ln -match $letRe){
        $body = $matches[2]
        $depth = 0; $start = 0
        for($j=0; $j -lt $body.Length; $j++){
            $cc = $body[$j]
            if('([{' -contains $cc){$depth++}
            elseif(')]}' -contains $cc){$depth--}
            elseif($cc -eq ',' -and $depth -eq 0){
                $seg = $body.Substring($start, $j-$start).Trim()
                $eq = [math]::Max($seg.IndexOf('='), $seg.IndexOf(':'))
                $name = if($eq -lt 0){$seg}else{$seg.Substring(0,$eq).Trim()}
                if($name){
                    if($decls.ContainsKey($name)){$decls[$name] += ",line $idx"} else{$decls[$name] = "line $idx"}
                }
                $start = $j + 1
            }
        }
        $seg = $body.Substring($start).Trim()
        $eq = [math]::Max($seg.IndexOf('='), $seg.IndexOf(':'))
        $name = if($eq -lt 0){$seg}else{$seg.Substring(0,$eq).Trim()}
        if($name){
            if($decls.ContainsKey($name)){$decls[$name] += ",line $idx"} else{$decls[$name] = "line $idx"}
        }
    }
}
$decls.GetEnumerator() | Where-Object{$_.Value -like '*,*'} | ForEach-Object{ [Console]::WriteLine("  $($_.Key) = $($_.Value)") }
