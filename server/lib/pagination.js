class Pagination{
	constructor(totalCount, currentPage, pageUri, perPage){
		this.perPage = perPage;
		this.totalCount = totalCount;
		this.currentPage = currentPage;
		this.previousPage = currentPage - 1;
		this.nextPage = this.currentPage + 1;
		this.pageCount = Math.ceil(this.totalCount / this.perPage);
		this.pageUri = pageUri;
		this.offset = this.currentPage > 1 ? this.previousPage * this.perPage : 0;
		this.sidePages = 3;
		this.pages = false;
	}

	links(alphaOmega=false,prevNext=true){
		this.pages='<ul class="pagination pagination-sm">';

		if(alphaOmega){
			var alphaDisabled = (this.previousPage > 0) ? '' : ' btn disabled';
			this.pages+='<li class="page-item"><a class="page-link'+alphaDisabled+'" href="'+this.pageUri + 1+'">&cuepr;</a></li>'
		}
		if(prevNext){
			var prevDisabled = (this.previousPage > 0) ? '' : ' btn disabled';
			this.pages+='<li class="page-item"><a class="page-link'+prevDisabled+'" href="'+this.pageUri + this.previousPage+'"">&pr;</a></li>';
		}

		/*Add back links*/
		if(this.currentPage > 1){
			for(var x = this.currentPage - this.sidePages; x < this.currentPage; x++){
				if(x > 0)
					this.pages+='<li class="page-item"><a class="page-link" href="'+this.pageUri+x+'">'+x+'</a></li>';
			}
		}

		/*Show current page*/
		this.pages+='<li class="page-item"><a class="page-link active" href="'+this.pageUri+this.currentPage+'">'+this.currentPage+'</a></li>';

		/*Add more links*/
		for(x = this.nextPage; x <= this.pageCount; x++){
			this.pages+='<li class="page-item"><a class="page-link" href="'+this.pageUri+x+'">'+x+' </a></li>';

			if(x >= this.currentPage + this.sidePages)
				break;
		}

		/*Display next buttton navigation*/
		if(prevNext){
			var nextDisabled = (this.currentPage + 1 <= this.pageCount) ? '' : ' btn disabled';
			this.pages+='<li class="page-item"><a class="page-link'+nextDisabled+'" href="'+this.pageUri+this.nextPage+'">&sc;</a></li>'
		}
		if(alphaOmega){
			var omegaDisabled = (this.currentPage + 1 <= this.pageCount) ? '' : ' btn disabled';
			this.pages+='<li class="page-item"><a class="page-link'+omegaDisabled+'" href="'+this.pageUri + this.pageCount+'">&cuesc;</a></li>'
		}
		this.pages+='</ul>';

		return this.pages;
	}
}

module.exports = Pagination;
