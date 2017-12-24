# editable TODO:

Excel like edit table

### Issues/TODO

* check other browsers compatibility - high
* Visual issue when window scrollbar appears,the focus selection appears wrong - normal
* Allow table selecting - normal
* Add proper scroll with fixed headers - trivial

### DONE:

History on changeSet:
instead of changeSet we can make a continuous changeSet push
on Commit we only send the latest unique rows with the operations

    each changeSet could have as:

    	{op: 'delete', row:{user:1,data:2}, index:5}
    	{op: 'update', row:{user:2,data:10}, oldRow:{user:2, data:11}}
    	{op: 'update', row:{user:2,data:4}, oldRow:{user:2, data:10}}
    	{op: 'add', row:{user:3,data:3}}

    the final change set would consist in:
    	{op: 'delete', row:{user:1,data:2}}
    	{op: 'update', row:{user:2,data:4}}
    	{op: 'add', row:{user:3,data:3}}
