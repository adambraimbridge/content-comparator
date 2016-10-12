import {Router, NavigationEnd, Event as NavigationEvent} from '@angular/router';
import {Component, Input, OnChanges} from '@angular/core';
import {UuidService} from '../../services/uuid.service';
import {StreamService} from '../../services/stream.service';

@Component({
  moduleId: module.id,
  selector: 'search-component',
  templateUrl: 'search-component.html'
})

export class SearchComponent {
    uuid: string;
    streamUrl: string;

    inputValue: string;
    legend: string;
    placeholder: string;
    section: string;

    router: Router;

    constructor(
        private uuidService: UuidService,
        private streamService: StreamService,
        private _router: Router
    ) {
        this.router = _router;

        this.router.events.subscribe((event: NavigationEvent) => {
            if (event instanceof NavigationEnd) {
                this.updateSection();
                this.updateSearchForm();
            }
        });
    }

    determinePlaceholder(section) {
        let placeholder;
        switch(section) {
        case 'lists':
            placeholder = 'stream URL or name';
            break;
        default:
            placeholder = 'UUID';
            break;
        }
        return placeholder;
    }

    updateSection() {
        const pattern = this.uuidService.getPattern();
        this.section = (this.router.url.replace(pattern, '')).replace(/\//g, '');
    }

    updateValue() {
        if (this.section === 'content') {
            this.inputValue = this.uuid;
        } else if (this.section === 'lists') {
            this.inputValue = this.streamUrl;
        } else {
            this.inputValue = this.uuid;
        }
    }

    updateSearchForm() {
        this.placeholder = this.determinePlaceholder(this.section);
        this.legend = 'Look up ' + this.section + ' by ' + this.placeholder;
    }

    handleContentValue(newValue) {
        if (this.uuidService.isValidUuid(newValue)) {
            this.uuidService.updateUuid(newValue);
        } else {
            this.inputValue = this.uuid;
        }
    }

    handleListsValue(newValue) {
        if (this.streamService.isValidStreamUrl(newValue)) {
            this.streamService.updateStreamUrl(newValue);
        } else {
            this.inputValue = this.streamUrl;
        }
    }

    convertUrl(newValue) {
        const anchor = document.createElement('a');
        anchor.href = newValue;
        return anchor.pathname.replace('/', '');// ['href','protocol','host','hostname','port','pathname','search','hash']
    }

    onValueChange(newValue) {
        if (this.section === 'content') {
            this.handleContentValue(newValue);
        } else if (this.section === 'lists') {
            newValue = this.convertUrl(newValue);
            this.handleListsValue(newValue);
        } else {
            this.uuidService.updateUuid(newValue);
        }
    }

    ngAfterContentChecked() {
        this.updateValue();
    }

    ngOnInit():any {
        this.updateSection();

        this.uuid = this.uuidService.uuid;
        this.streamUrl = this.streamService.streamUrl;

        this.uuidService.uuidStream$.subscribe(uuid => {
            if (this.uuidService.isValidUuid(uuid) && uuid !== this.uuid) {
                this.uuid = uuid;
            }
        });

        this.streamService.streamUrlStream$.subscribe(streamUrl => {
            if (this.streamService.isValidStreamUrl(streamUrl) && streamUrl !== this.streamUrl) {
                this.streamUrl = streamUrl;
            }
        });
    }
}
