---
layout: post
title:  "Data analysis first aid on the command line"
date:   2018-03-20 08:00:00
categories: bash command-line data
---

## Why use the command line at all?

Like the title hopefully gets across, I'm not using the command line to do advanced data science. I'm doing first aid, not surgery. There are some basic questions you can answer by using the command line instead of having to write Python or R or import into a database. What I'm writing here isn't the most efficient use of command line utilities, but it will get the job done, even for files a few gigabytes in size.

For my work, I'll often have a CSV or a semi-structured log file on a server somewhere that I want to "query" quickly without having to download the file to my laptop to analyze. Servers that run code have constraints in that they aren't going to have fancy Python packages or other more advanced tools. What they're going to have are the basic core utilities included on a linux install.

## Let's play with some data about US cities

I found a dataset that has a list of US cities with populations. [You can download it from the Census data portal yourself!](https://factfinder.census.gov/bkmk/table/1.0/en/PEP/2016/PEPANNRSIP.US12A
) Downloading that gives you a zip file with a CSV called `PEP_2016_PEPANNRSIP.US12A_with_ann.csv`. That's our data and that's what we're going to be playing with.

## Get a first look

We can use `head` to "peek" at the file. 

>SQL equivalent: when doing a select on potentially a lot of data, you'll probably do a `limit 10` on the query so that you don't return all rows. Using `head` limits the output to 10 lines which makes interactive development easier.

{% highlight bash %}
$ head PEP_2016_PEPANNRSIP.US12A_with_ann.csv
GEO.id,GEO.id2,GEO.display-label,GC_RANK.target-geo-id,GC_RANK.target-geo-id2,GC_RANK.rank-label,GC_RANK.display-label,GC_RANK.display-label,rescensus42010,resbase42010,respop72010,respop72011,respop72012,respop72013,respop72014,respop72015,respop72016
Id,Id2,Geography,Target Geo Id,Target Geo Id2,Rank,Geography,Geography,"April 1, 2010 - Census","April 1, 2010 - Estimates Base",Population Estimate (as of July 1) - 2010,Population Estimate (as of July 1) - 2011,Population Estimate (as of July 1) - 2012,Population Estimate (as of July 1) - 2013,Population Estimate (as of July 1) - 2014,Population Estimate (as of July 1) - 2015,Population Estimate (as of July 1) - 2016
0100000US,,United States,1620000US3651000,3651000,1,"United States - New York city, New York","New York city, New York",8175133,8174962,8192026,8284098,8361179,8422460,8471990,8516502,8537673
0100000US,,United States,1620000US0644000,0644000,2,"United States - Los Angeles city, California","Los Angeles city, California",3792621,3792584,3796292,3825393,3858137,3890436,3920173,3949149,3976322
0100000US,,United States,1620000US1714000,1714000,3,"United States - Chicago city, Illinois","Chicago city, Illinois",2695598,2695620,2697736,2705404,2714120,2718887,2718530,2713596,2704958
0100000US,,United States,1620000US4835000,4835000,4,"United States - Houston city, Texas","Houston city, Texas",2099451,2100277,2105625,2132157,2166458,2204406,2243999,2284816,2303482
0100000US,,United States,1620000US0455000,0455000,5,"United States - Phoenix city, Arizona","Phoenix city, Arizona",1445632,1447624,1450629,1469353,1499007,1525562,1554179,1582904,1615017
0100000US,,United States,1620000US4260000,4260000,6,"United States - Philadelphia city, Pennsylvania","Philadelphia city, Pennsylvania",1526006,1526006,1528427,1539022,1550379,1555868,1560609,1564964,1567872
0100000US,,United States,1620000US4865000,4865000,7,"United States - San Antonio city, Texas","San Antonio city, Texas",1327407,1327538,1333952,1359002,1385250,1411652,1439150,1468037,1492510
0100000US,,United States,1620000US0666000,0666000,8,"United States - San Diego city, California","San Diego city, California",1307402,1301722,1306153,1320686,1338983,1358242,1379299,1390915,1406630
{% endhighlight %}

What can we see here?

Row-wise, we have 2 lines of headers and then the data. For columns, the first few columns are a lot of geographic identifies the Census uses, then a friendly name, then population values from 2010 through 2016.

## Single out the columns we want

`cut` is a utility that we can use to get all this data into a manageable state.

>SQL equivalent: going from `select *` to selecting only the columns you actually want

{% highlight bash %}
$ head PEP_2016_PEPANNRSIP.US12A_with_ann.csv | cut -d',' -f9,10,19
rescensus42010,resbase42010
"April 1, 2010 - Census",Population Estimate (as of July 1) - 2016
"New York city, New York",8537673
"Los Angeles city, California",3976322
"Chicago city, Illinois",2704958
"Houston city, Texas",2303482
"Phoenix city, Arizona",1615017
"Philadelphia city, Pennsylvania",1567872
"San Antonio city, Texas",1492510
"San Diego city, California",1406630
{% endhighlight %}

We pass cut a few different parameters:
* `-d` is the delimiter, since this a CSV we use a comma
* `-f` takes column numbers, which columns we want. Note that cut doesn't understand quotes, so while using a real CSV parser this would be 2 columns, we have to select 3 to get all the fields we want.

## Formatting the data a little more

Two things with our output that I don't like. One is we still have the two header rows and the other are the quotes around the place name. I'd like to see the place, the state, and the population as 3 distinct columns.


Switching to `tail` and starting at line 3 will get rid of the header columns for us.

{% highlight bash %}
tail -n +3 PEP_2016_PEPANNRSIP.US12A_with_ann.csv 
{% endhighlight %}

Going back to using `cut` to get only the columns we want:

{% highlight bash %}
$ tail -n +3 PEP_2016_PEPANNRSIP.US12A_with_ann.csv | head | cut -d',' -f9,10,19
"New York city, New York",8537673
"Los Angeles city, California",3976322
"Chicago city, Illinois",2704958
"Houston city, Texas",2303482
"Phoenix city, Arizona",1615017
"Philadelphia city, Pennsylvania",1567872
"San Antonio city, Texas",1492510
"San Diego city, California",1406630
"Dallas city, Texas",1317929
"San Jose city, California",1025350
{% endhighlight %}


We can use `sed` to do a basic search and replace to get rid of the quotes and leave us with a plain csv file.

{% highlight bash %}
$ tail -n +3 PEP_2016_PEPANNRSIP.US12A_with_ann.csv | head |
cut -d',' -f9,10,19 | sed 's/"//g' | sed 's/, /,/'

New York city,New York,8537673
Los Angeles city,California,3976322
Chicago city,Illinois,2704958
Houston city,Texas,2303482
Phoenix city,Arizona,1615017
Philadelphia city,Pennsylvania,1567872
San Antonio city,Texas,1492510
San Diego city,California,1406630
Dallas city,Texas,1317929
San Jose city,California,1025350
{% endhighlight %}


## First question: Should we get rid of the "city"?

This data is sorted by population size, so the largest values are what we're seeing at the top of the file. This city value seems to get repeated a lot, is it the same for all the data we have?

>SQL equivalent: `grep -v` is the same as `where !=` on a line by line basis. So `grep -v city` will return lines that *don't* have "city" in them.

{% highlight bash %}
$ tail -n +3 PEP_2016_PEPANNRSIP.US12A_with_ann.csv | cut -d',' -f9,10,19 |
sed 's/"//g' | sed 's/, /,/' | grep -v city | head

Nashville-Davidson metropolitan government (balance),Tennessee,660388
Louisville/Jefferson County metro government (balance),Kentucky,616261
Urban Honolulu CDP,Hawaii,351792
Lexington-Fayette urban county,Kentucky,318449
Anchorage municipality,Alaska,298192
Gilbert town,Arizona,237133
Augusta-Richmond County consolidated government (balance),Georgia,197081
Cary town,North Carolina,162320
Macon-Bibb County,Georgia,152555
Athens-Clarke County unified government (balance),Georgia,123371
{% endhighlight %}

So there are some entries that don't have city in them, so let's keep that in. 

## "Saving" our work

We have a pretty sizeable command built up now. Let's write this new format to a file to save our work.

{% highlight bash %}
$ tail -n +3 PEP_2016_PEPANNRSIP.US12A_with_ann.csv | cut -d',' -f9,10,19 |
sed 's/"//g' | sed 's/, /,/' > populations.csv
{% endhighlight %}

At the end of our command (without `head` limiting it), we put the `>` character and a file name which redirects the output to the file.

## Answering some questions

We have the data in a good format now, let's answer some questions.

### How many records do we have?

Since a CSV is one record per line, we just count the number of lines.

{% highlight bash %}
$ cat populations.csv | wc -l 
     761 populations.csv
{% endhighlight %}

761 cities in our list.

>Useless use of cat warning: Some people will be a jerk about writing a command like the one above, since `wc` can take the file directly, it could just be `wc -l populations.csv`. If that was the only command I was writing then sure. But playing with data is an interactive endeavor, changing the commands and arguments around many times. It's a lot faster to edit the end of the command rather than jumping to the beginning of the command to edit it. So while our use of `cat` here is "useless", that argument is missing the forest for the trees.

### How many places in PA?

I live in Pennsylvania, so let's see my home state.

>SQL equivalent: `grep` is like a `where =` on a line by line basis. 

{% highlight bash %}
$ cat populations.csv | grep 'Pennsylvania'

Philadelphia city,Pennsylvania,1567872
Pittsburgh city,Pennsylvania,303625
Allentown city,Pennsylvania,120443
Erie city,Pennsylvania,98593
Reading city,Pennsylvania,87575
Scranton city,Pennsylvania,77291
Bethlehem city,Pennsylvania,75293
Lancaster city,Pennsylvania,59218
{% endhighlight %}

### How many places for each state?

This will take a few steps.

First, let's only get the state field.

{% highlight bash %}
$ cat populations.csv | cut -d',' -f2 | head
{% endhighlight %}

Now, we can use `sort` and `uniq` to group the values together.
> `uniq` has to be paired with `sort` because `uniq` only works on sorted input.

{% highlight bash %}
$ cat populations.csv | cut -d',' -f2 | sort | uniq -c | sort -nr | head
 178 California
  65 Texas
  57 Florida
  29 Illinois
  25 Michigan
  24 Washington
  22 Massachusetts
  19 Minnesota
  19 Colorado
  18 North Carolina
{% endhighlight %}

Using `uniq` is similar to using a SQL `group by`. What the above command is doing is sort of like:

{% highlight sql %}
select count(*), state
from populations
group by state
order by count(*) desc
limit 10
{% endhighlight %}

## Sorting the results by state and then by population

This is one of my favorite tools. `sort` is often used on the entire line of input, but can be made to use individual fields of the line. 

{% highlight bash %}
$ sort -t',' -k2,2 -k3,3nr populations.csv
{% endhighlight %}

Let's break the arguments down:
* `-t` - This is the field delimiter, what our columns are separated by.
* `-k2,2` - This is the first "key" to sort on. We're starting at the second column and ending at the second column, so this sorts by state.
* `-k3,3nr` - This is the second key to sort on, the third column which is population. We add `n` to sort numerically not alphabetically and `r` to sort largest to smallest.

The command will output the entire file sorted, but we can look at some individual examples to see the results.

{% highlight bash %}
$ sort -t',' -k2,2 -k3,3nr populations.csv | head
Birmingham city,Alabama,212157
Montgomery city,Alabama,200022
Huntsville city,Alabama,193079
Mobile city,Alabama,192904
Tuscaloosa city,Alabama,99543
Hoover city,Alabama,84978
Dothan city,Alabama,68468
Auburn city,Alabama,63118
Decatur city,Alabama,55072
Anchorage municipality,Alaska,298192

$ sort -t',' -k2,2 -k3,3nr populations.csv | grep California | head
Los Angeles city,California,3976322
San Diego city,California,1406630
San Jose city,California,1025350
San Francisco city,California,870887
Fresno city,California,522053
Sacramento city,California,495234
Long Beach city,California,470130
Oakland city,California,420005
Bakersfield city,California,376380
Anaheim city,California,351043

# Note I was looking for states that start with Miss, but grep
# works on a line basis, so we got this city in California too.
# But this proves the sort by state is working!
$ sort -t',' -k2,2 -k3,3nr populations.csv | grep Miss | head
Mission Viejo city,California,96396
Jackson city,Mississippi,169148
Gulfport city,Mississippi,72076
Southaven city,Mississippi,53214
Kansas City city,Missouri,481420
St. Louis city,Missouri,311404
Springfield city,Missouri,167319
Columbia city,Missouri,120612
Independence city,Missouri,117030
Lee\'s Summit city,Missouri,96076
{% endhighlight %}
