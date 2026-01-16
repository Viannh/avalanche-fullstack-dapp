import { Controller, Get } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";

@Controller("blockchain")
export class BlockchainController {
    constructor(private readonly blockchainService: BlockchainService) { }

    // GET /blockchain/value
    @Get("value")
    async getValue() {
        return this.blockchainService.getLatestValue();
    }

    // GET /blockchain/events
    @Get("events")
    async getEvents() {
        return this.blockchainService.getValueUpdatedEvents();
    }
}
