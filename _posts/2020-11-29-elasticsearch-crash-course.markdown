---
layout: post
title:  "Elasticsearch crash course"
date:   2020-11-29 22:30:00
categories: elasticsearch
---

I've worked with Elasticsearch for a number of years. It's been a major project for over 10 years and has a **lot** of features, so it can be really hard to figure out where to start. A friend recently came to me and said "Just started with Elasticsearch, how do I get up to speed?" and this post is an extended version of what I told them.

## Definitions dump

<dl>
  <dt><strong>Document</strong></dt>
  <dd>The individual thing you want to search on, defined in JSON. A row in SQL.</dd>

  <dt><strong>Mappings</strong></dt>
  <dd>The formal definition of how to store the data in a document. A schema in SQL. This lets you define what fields are dates or booleans or strings.</dd>

  <dt><strong>Index</strong></dt>
  <dd>A group of documents. A table in SQL. Older versions of Elasticsearch allowed you to have different document types in a single index, i.e. a document type for books and a document type for authors, but this is no longer allowed, all documents in an index should be the same type.</dd>

  <dt><strong>Shard</strong></dt>
  <dd>An Index is broken up into a number of shards and this is the way that data is spread across many servers in an Elasticsearch cluster. Each shard is a [lucene index](https://lucene.apache.org/) which is the underlying engine of Elasticsearch.</dd>
</dl>

## Get used to curl

Almost everything you want to do with Elasticsearch is doable via an HTTP API. You can use curl or your favorite HTTP client and don't need to install something like a MySQL client. Elasticsearch uses a binary format for communication _within_ the cluster, but the user interface is just HTTP port 9200. Of particular note are the [cat APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/cat.html) which are built specifically with text responses meant to be displayed to humans.

## Figure out what version of Elasticsearch you're using

Elasticsearch versioning is pretty notorious for having significant breaking changes between major versions that involve having to make application changes and re-write your underlying data to make your data compatible. It also releases pretty often, so every company that I've worked at has had several clusters lag on versioning. So, you need to figure out what version you're running to make sure you're reading the correct docs on what you're capable of doing.

## Filters vs queries

When getting data _out_ of Elasticsearch, it's most likely you'll use the [search API](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html) and the [JSON query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html). Query tuning for performance and **good** search results is a huge topic and this is a crash course so: use filters when possible. Search terms can be executed as a _query_ or a _filter_. 

Let's use a recipe site as an example. If search for `beef` through the one million recipes, that would be a query. Elasticsearch will go through each recipe and _rank_ the documents depending on how prominent the word beef is. This is quite a bit of work to go through each recipe, but that's what I asked for. 

Now I want to refine my results to my favorite recipe writer. If 1% of recipes are written by a particular writer, I could add a query for that author, but it'd be much better to filter for that author. If the author field is [mapped as a keyword type](https://www.elastic.co/guide/en/elasticsearch/reference/current/keyword.html), Elasticsearch can very quickly reduce the documents to search to the 1% of recipes with my favorite recipe writer and search just those for `beef`.

Filters are key to improving performance, but don't help at all in relevance.

## Eventually consistent...kind of

Elasticsearch is eventually consistent for search. That means when you write some data to Elasticsearch and then _search_ for it, it might not show up yet. Elasticsearch uses a background process to write the data in a format needed for searching and to make it present in the index. However, the [document APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-get.html) are consistent. If you store a document and immediately get it by its ID, that will work.

## Part Two...in the future!

If this has been helpful to you or you have suggestions for a part two, let me know! Contact info is in the page footer.
